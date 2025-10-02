'use client';

import { useState } from 'react';
import PageLayout from '@/app/components/PageLayout';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  // Step 1: Business Info
  businessName: string;
  businessType: string;
  industry: string;
  website: string;
  
  // Step 2: Location & Hours
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  
  // Step 3: Services
  services: string[];
  primaryService: string;
  
  // Step 4: Goals
  primaryGoal: string;
  monthlyBudget: string;
  targetAudience: string;
}

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: true },
      sunday: { open: '09:00', close: '17:00', closed: true },
    },
    services: [],
    primaryService: '',
    primaryGoal: '',
    monthlyBudget: '',
    targetAudience: '',
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof OnboardingData, value: string | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData({
      ...formData,
      hours: {
        ...formData.hours,
        [day]: {
          ...formData.hours[day as keyof typeof formData.hours],
          [field]: value,
        },
      },
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#34d399', '#6ee7b7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    setIsComplete(true);
    triggerConfetti();
  };

  const handleGoToDashboard = () => {
    router.push('/home');
  };

  const calculateProgress = () => {
    const requiredFields = [
      formData.businessName,
      formData.businessType,
      formData.industry,
      formData.address,
      formData.city,
      formData.state,
      formData.zipCode,
      formData.primaryService,
      formData.primaryGoal,
    ];
    const filledFields = requiredFields.filter(field => field !== '').length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  // Completion Screen
  if (isComplete) {
    return (
      <PageLayout title="Onboarding Complete">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-12 text-center">
            {/* Success Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome to SustainAd, {formData.businessName}!
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Your account has been successfully set up
            </p>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
                <div className="text-green-500 text-4xl font-bold mb-2">100%</div>
                <p className="text-gray-400">Profile Complete</p>
              </div>
              <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
                <div className="text-green-500 text-4xl font-bold mb-2">✓</div>
                <p className="text-gray-400">Account Verified</p>
              </div>
              <div className="bg-gray-900 border border-gray-600 rounded-lg p-6">
                <div className="text-green-500 text-4xl font-bold mb-2">Ready</div>
                <p className="text-gray-400">Campaign Status</p>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-xl font-bold text-white mb-4">Your Account Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Business Name</p>
                  <p className="text-white font-semibold">{formData.businessName}</p>
                </div>
                <div>
                  <p className="text-gray-400">Industry</p>
                  <p className="text-white font-semibold">{formData.industry}</p>
                </div>
                <div>
                  <p className="text-gray-400">Location</p>
                  <p className="text-white font-semibold">{formData.city}, {formData.state}</p>
                </div>
                <div>
                  <p className="text-gray-400">Primary Goal</p>
                  <p className="text-white font-semibold capitalize">{formData.primaryGoal}</p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Explore Your Dashboard</p>
                    <p className="text-gray-400 text-sm">Get familiar with the platform features</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Set Up Your First Campaign</p>
                    <p className="text-gray-400 text-sm">Launch targeted ads to reach your audience</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">Track Your Performance</p>
                    <p className="text-gray-400 text-sm">Monitor results and optimize your campaigns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/campaign')}
                className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold text-lg"
              >
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Rest of the onboarding form (steps 1-5) - keep all the existing code
  return (
    <PageLayout title="Onboarding and Data Foundation">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">Account Setup Wizard</h2>
          <p className="text-gray-400 text-lg">Let&apos;s get your business set up in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{calculateProgress()}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          {/* All your existing step components (Step 1-5) go here - keep them exactly as they were */}
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white mb-4">Business Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Business Type *
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">Select business type</option>
                  <option value="retail">Retail</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="service">Service Provider</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Industry *
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., Sustainable Fashion, Organic Food"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location & Contact */}
            {currentStep === 2 && (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-4">Location & Contact</h3>
                
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Street Address *
                </label>
                <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="123 Main St"
                    required
                />
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                    </label>
                    <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="City"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    State *
                    </label>
                    <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="State"
                    required
                    />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    ZIP Code *
                    </label>
                    <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData('zipCode', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="12345"
                    required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                    </label>
                    <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="(555) 123-4567"
                    />
                </div>
                </div>
            </div>
            )}

            {/* Step 3: Business Hours */}
            {currentStep === 3 && (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-4">Business Hours</h3>
                <p className="text-gray-400 mb-4">Set your regular business hours</p>
                
                {Object.keys(formData.hours).map((day) => (
                <div key={day} className="flex items-center gap-4">
                    <div className="w-32">
                    <span className="text-gray-300 capitalize">{day}</span>
                    </div>
                    
                    <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.hours[day as keyof typeof formData.hours].closed}
                        onChange={(e) => updateHours(day, 'closed', e.target.checked)}
                        className="mr-2"
                    />
                    <span className="text-gray-400 text-sm">Closed</span>
                    </label>

                    {!formData.hours[day as keyof typeof formData.hours].closed && (
                    <>
                        <input
                        type="time"
                        value={formData.hours[day as keyof typeof formData.hours].open}
                        onChange={(e) => updateHours(day, 'open', e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                        type="time"
                        value={formData.hours[day as keyof typeof formData.hours].close}
                        onChange={(e) => updateHours(day, 'close', e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </>
                    )}
                </div>
                ))}
            </div>
            )}

            {/* Step 4: Services */}
            {currentStep === 4 && (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-4">Services & Products</h3>
                
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Service/Product *
                </label>
                <input
                    type="text"
                    value={formData.primaryService}
                    onChange={(e) => updateFormData('primaryService', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="What do you primarily offer?"
                    required
                />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Services (comma separated)
                </label>
                <textarea
                    value={formData.services.join(', ')}
                    onChange={(e) => updateFormData('services', e.target.value.split(',').map(s => s.trim()))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Service 1, Service 2, Service 3"
                    rows={4}
                />
                </div>
            </div>
            )}

            {/* Step 5: Goals & Preview */}
            {currentStep === 5 && (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-4">Goals & Campaign Setup</h3>
                
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Marketing Goal *
                </label>
                <select
                    value={formData.primaryGoal}
                    onChange={(e) => updateFormData('primaryGoal', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                >
                    <option value="">Select your primary goal</option>
                    <option value="awareness">Brand Awareness</option>
                    <option value="traffic">Drive Website Traffic</option>
                    <option value="leads">Generate Leads</option>
                    <option value="sales">Increase Sales</option>
                    <option value="engagement">Customer Engagement</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Budget
                </label>
                <select
                    value={formData.monthlyBudget}
                    onChange={(e) => updateFormData('monthlyBudget', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                    <option value="">Select budget range</option>
                    <option value="500">$500 - $1,000</option>
                    <option value="1000">$1,000 - $2,500</option>
                    <option value="2500">$2,500 - $5,000</option>
                    <option value="5000">$5,000+</option>
                </select>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Audience
                </label>
                <textarea
                    value={formData.targetAudience}
                    onChange={(e) => updateFormData('targetAudience', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Describe your ideal customer (age, interests, location, etc.)"
                    rows={3}
                />
                </div>

                {/* Preview Section */}
                <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-600">
                <h4 className="text-xl font-bold text-white mb-4">Preview Your Setup</h4>
                <div className="space-y-2 text-sm">
                    <p className="text-gray-300"><strong>Business:</strong> {formData.businessName || 'Not set'}</p>
                    <p className="text-gray-300"><strong>Type:</strong> {formData.businessType || 'Not set'}</p>
                    <p className="text-gray-300"><strong>Location:</strong> {formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Not set'}</p>
                    <p className="text-gray-300"><strong>Primary Service:</strong> {formData.primaryService || 'Not set'}</p>
                    <p className="text-gray-300"><strong>Goal:</strong> {formData.primaryGoal || 'Not set'}</p>
                </div>
                </div>
            </div>
            )}
          

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-semibold"
              >
                Complete Setup & Launch Campaign
              </button>
            )}
          </div>
        </div>

        {/* Success Metrics Display */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Time Elapsed</p>
            <p className="text-2xl font-bold text-white">~5 min</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Fields Completed</p>
            <p className="text-2xl font-bold text-green-500">{calculateProgress()}%</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Campaign Status</p>
            <p className="text-2xl font-bold text-yellow-500">Pending</p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}