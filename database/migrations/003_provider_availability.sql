-- Create provider_availability table for managing provider schedules and notification preferences
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE UNIQUE,
  
  -- Weekly availability schedule
  availability JSONB NOT NULL DEFAULT '{
    "monday": {"enabled": true, "start": "09:00", "end": "17:00", "breaks": []},
    "tuesday": {"enabled": true, "start": "09:00", "end": "17:00", "breaks": []},
    "wednesday": {"enabled": true, "start": "09:00", "end": "17:00", "breaks": []},
    "thursday": {"enabled": true, "start": "09:00", "end": "17:00", "breaks": []},
    "friday": {"enabled": true, "start": "09:00", "end": "17:00", "breaks": []},
    "saturday": {"enabled": false, "start": "10:00", "end": "14:00", "breaks": []},
    "sunday": {"enabled": false, "start": "10:00", "end": "14:00", "breaks": []}
  }',
  
  -- Notification preferences
  notification_settings JSONB NOT NULL DEFAULT '{
    "sms": true,
    "email": true,
    "push": true,
    "whatsapp": false,
    "phone": "",
    "notification_hours": {
      "start": "08:00",
      "end": "20:00"
    },
    "auto_accept": false,
    "auto_accept_hours": {
      "start": "09:00",
      "end": "17:00"
    }
  }',
  
  -- Consultation types and pricing
  consultation_types JSONB NOT NULL DEFAULT '[
    {"type": "general", "duration": 30, "price": 80, "enabled": true},
    {"type": "follow_up", "duration": 15, "price": 40, "enabled": true},
    {"type": "prescription", "duration": 20, "price": 50, "enabled": true},
    {"type": "nutrition", "duration": 45, "price": 90, "enabled": false},
    {"type": "behavior", "duration": 60, "price": 120, "enabled": false},
    {"type": "second_opinion", "duration": 30, "price": 100, "enabled": false}
  ]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_id ON provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_updated_at ON provider_availability(updated_at DESC);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_provider_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_provider_availability_updated_at ON provider_availability;
CREATE TRIGGER update_provider_availability_updated_at
  BEFORE UPDATE ON provider_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_provider_availability_updated_at();

-- Create booking_notifications table for tracking notification history
CREATE TABLE IF NOT EXISTS booking_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES consultation_bookings(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN ('sms', 'email', 'push', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  message TEXT NOT NULL,
  
  -- Delivery details
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  
  -- External service IDs (for tracking with SMS/email providers)
  external_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for notification tracking
CREATE INDEX IF NOT EXISTS idx_booking_notifications_booking_id ON booking_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_provider_id ON booking_notifications(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_status ON booking_notifications(status);
CREATE INDEX IF NOT EXISTS idx_booking_notifications_created_at ON booking_notifications(created_at DESC);

-- Create function to get available time slots for a provider on a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_provider_id UUID,
  p_date DATE,
  p_consultation_duration INTEGER DEFAULT 30
)
RETURNS TABLE(slot_time TIME, slot_datetime TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  availability_data JSONB;
  day_name TEXT;
  day_schedule JSONB;
  start_time TIME;
  end_time TIME;
  current_slot TIME;
  slot_duration INTERVAL;
BEGIN
  -- Get day name (lowercase)
  day_name := lower(to_char(p_date, 'Day'));
  day_name := trim(day_name);
  
  -- Get provider availability
  SELECT availability INTO availability_data
  FROM provider_availability
  WHERE provider_id = p_provider_id;
  
  -- If no availability data, return empty
  IF availability_data IS NULL THEN
    RETURN;
  END IF;
  
  -- Get schedule for the specific day
  day_schedule := availability_data->day_name;
  
  -- If day is not enabled, return empty
  IF NOT (day_schedule->>'enabled')::BOOLEAN THEN
    RETURN;
  END IF;
  
  -- Get start and end times
  start_time := (day_schedule->>'start')::TIME;
  end_time := (day_schedule->>'end')::TIME;
  slot_duration := (p_consultation_duration || ' minutes')::INTERVAL;
  
  -- Generate time slots
  current_slot := start_time;
  WHILE current_slot + slot_duration <= end_time LOOP
    -- Check if slot is not already booked
    IF NOT EXISTS (
      SELECT 1 FROM consultation_bookings 
      WHERE provider_id = p_provider_id 
      AND preferred_date = p_date 
      AND preferred_time = current_slot::TEXT
      AND status NOT IN ('cancelled', 'no_show')
    ) THEN
      slot_time := current_slot;
      slot_datetime := (p_date + current_slot)::TIMESTAMP WITH TIME ZONE;
      RETURN NEXT;
    END IF;
    
    current_slot := current_slot + slot_duration;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create function to send booking notifications
CREATE OR REPLACE FUNCTION send_booking_notification(
  p_booking_id UUID,
  p_notification_type TEXT,
  p_message TEXT
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  provider_settings JSONB;
  current_time TIME;
  notification_start TIME;
  notification_end TIME;
  should_send BOOLEAN := FALSE;
BEGIN
  -- Get provider notification settings
  SELECT pa.notification_settings INTO provider_settings
  FROM consultation_bookings cb
  JOIN provider_availability pa ON cb.provider_id = pa.provider_id
  WHERE cb.id = p_booking_id;
  
  -- Check if this notification type is enabled
  IF (provider_settings->>p_notification_type)::BOOLEAN THEN
    -- Check if we're within notification hours
    current_time := CURRENT_TIME;
    notification_start := (provider_settings->'notification_hours'->>'start')::TIME;
    notification_end := (provider_settings->'notification_hours'->>'end')::TIME;
    
    IF current_time >= notification_start AND current_time <= notification_end THEN
      should_send := TRUE;
    END IF;
  END IF;
  
  -- Create notification record
  INSERT INTO booking_notifications (
    booking_id,
    provider_id,
    notification_type,
    message,
    status
  )
  SELECT 
    p_booking_id,
    cb.provider_id,
    p_notification_type,
    p_message,
    CASE WHEN should_send THEN 'pending' ELSE 'skipped' END
  FROM consultation_bookings cb
  WHERE cb.id = p_booking_id
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for provider_availability
CREATE POLICY "Providers can manage their own availability" ON provider_availability
FOR ALL USING (
  provider_id IN (
    SELECT id FROM providers WHERE email = auth.jwt() ->> 'email'
  )
);

-- Create policies for booking_notifications
CREATE POLICY "Providers can view their own notifications" ON booking_notifications
FOR SELECT USING (
  provider_id IN (
    SELECT id FROM providers WHERE email = auth.jwt() ->> 'email'
  )
);

-- Allow system to insert notifications
CREATE POLICY "Allow system to create notifications" ON booking_notifications
FOR INSERT WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE provider_availability IS 'Stores provider availability schedules and notification preferences';
COMMENT ON COLUMN provider_availability.availability IS 'Weekly schedule with enabled days, start/end times, and breaks';
COMMENT ON COLUMN provider_availability.notification_settings IS 'Notification preferences including methods, hours, and auto-accept settings';
COMMENT ON COLUMN provider_availability.consultation_types IS 'Available consultation types with duration and pricing';

COMMENT ON TABLE booking_notifications IS 'Tracks all notifications sent to providers about bookings';
COMMENT ON FUNCTION get_available_slots IS 'Returns available time slots for a provider on a specific date';
COMMENT ON FUNCTION send_booking_notification IS 'Creates notification records for booking events';

-- Grant appropriate permissions
GRANT ALL ON provider_availability TO authenticated;
GRANT SELECT, INSERT ON booking_notifications TO anon;
GRANT ALL ON booking_notifications TO authenticated;