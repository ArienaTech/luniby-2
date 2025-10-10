import React from 'react';
import { HealthIcon } from './MinimalIcons';

const ProfileHeader = ({ 
  profile, 
  user, 
  profilePhotoUrl, 
  pets = [], 
  healthStats = {}, 
  bookings = [],
  onPhotoUpload
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
      {/* Cover Photo */}
      <div className="h-28 sm:h-32 lg:h-40 bg-white relative border-b border-gray-100">
        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
          <div className="flex items-end space-x-3 sm:space-x-4">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full p-1 shadow-lg border border-gray-200">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePhotoUrl ? (
                    <img src={profilePhotoUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    // Show role-specific avatar based on user metadata or profile role
                    (() => {
                      const userRole = user?.user_metadata?.user_type || profile?.role;
                      
                      if (userRole === 'pet_owner') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-owner.svg" 
                            alt="Pet Owner" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'breeder') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/breeder.svg" 
                            alt="Breeder" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'nutritionist') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/nutritionist.svg" 
                            alt="Nutritionist" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'holistic_care') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/holistic-care.svg" 
                            alt="Holistic Care" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'pet_business') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/PetBusiness.svg" 
                            alt="Pet Business" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'trainer') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/pet-trainer.svg" 
                            alt="Trainer" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'groomer') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/groomer.svg" 
                            alt="Groomer" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'veterinarian') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet.svg" 
                            alt="Veterinarian" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else if (userRole === 'vet_nurse') {
                        return (
                          <img 
                            src="https://wagrmmbkukwblfpfxxcb.supabase.co/storage/v1/object/public/web-img/vet-nurse%20(1).svg" 
                            alt="Vet Nurse" 
                            className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
                          />
                        );
                      } else {
                        return <span className="text-xl sm:text-2xl lg:text-3xl">👤</span>;
                      }
                    })()
                  )}
                  </div>
                </div>
                {/* Camera Button - Desktop Only, on Avatar */}
                {onPhotoUpload && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onPhotoUpload}
                      className="hidden"
                      id="profile-photo-upload-header"
                    />
                    <label
                      htmlFor="profile-photo-upload-header"
                      className="hidden sm:flex absolute bottom-0 right-0 w-6 h-6 bg-[#5EB47C] rounded-full items-center justify-center text-white text-xs shadow-lg hover:bg-[#4A9A64] transition-colors cursor-pointer border border-white"
                    >
                      <HealthIcon type="camera" className="w-3 h-3" color="white" />
                    </label>
                  </>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 text-gray-800 pb-1 sm:pb-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Pet Parent'}
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Loving parent to {pets.length} amazing pet{pets.length !== 1 ? 's' : ''}
                </p>
              </div>
          </div>
        </div>
      </div>
      
      {/* Profile Stats Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t">
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <div className="text-base sm:text-lg font-bold text-gray-900">{pets.length}</div>
            <div className="text-xs text-gray-500">Pets</div>
          </div>
          <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
          <div className="flex-1">
            <div className="text-base sm:text-lg font-bold text-green-600">{healthStats.healthPercentage || 0}%</div>
            <div className="text-xs text-gray-500">Health</div>
          </div>
          <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
          <div className="flex-1">
            <div className="text-base sm:text-lg font-bold text-blue-600">{bookings.length}</div>
            <div className="text-xs text-gray-500">Bookings</div>
          </div>
          <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
          <div className="flex-1">
            <div className="text-base sm:text-lg font-bold text-purple-600">
              {pets.reduce((total, pet) => total + (pet.health_records?.length || 0), 0)}
            </div>
            <div className="text-xs text-gray-500">Records</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;