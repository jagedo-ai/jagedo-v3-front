/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';

/**
 * useProfileCompletion Hook
 * 
 * Tracks completion status for profile sections:
 * - Account Info: Always complete (filled during signup)
 * - Address: Always complete (filled during signup)
 * - Experience: Complete when all required fields are filled
 * - Account Uploads: Complete when all required documents are uploaded
 */

export const useProfileCompletion = (userData: any, userType: string) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    // Listen to BOTH 'storage' and 'localStorageUpdate' events
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('localStorageUpdate', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('localStorageUpdate', handleUpdate);
    };
  }, []);

  const completionStatus = useMemo(() => {
    // Default: Account Info and Address are always complete
    const status: Record<string, 'complete' | 'incomplete'> = {
      'account-info': 'complete',
      'address': 'complete',
      'experience': 'incomplete',
      'account-uploads': 'incomplete',
      'products': 'incomplete',
    };

    if (!userData) return status;

    // ============================================
    // CHECK EXPERIENCE COMPLETION
    // ============================================
    const userTypeUpper = userType?.toUpperCase() || '';

    if (userTypeUpper === 'CUSTOMER') {
      // Customers don't have experience section
      status['experience'] = 'complete';
    } else if (userTypeUpper === 'FUNDI') {
      const profile = userData?.userProfile || {};
      const hasGrade = !!profile.grade;
      const hasExperience = !!profile.experience;
      const hasProjects = profile.previousJobPhotoUrls?.length > 0;
      status['experience'] = (hasGrade && hasExperience && hasProjects) ? 'complete' : 'incomplete';
    } else if (userTypeUpper === 'PROFESSIONAL') {
      const profile = userData?.userProfile || {};
      const hasProfession = !!profile.profession;
      const hasLevel = !!profile.professionalLevel;
      const hasYears = !!profile.yearsOfExperience;
      const hasProjects = profile.professionalProjects?.length > 0;
      status['experience'] = (hasProfession && hasLevel && hasYears && hasProjects) ? 'complete' : 'incomplete';
    } else if (userTypeUpper === 'CONTRACTOR') {
      const profile = userData?.userProfile || {};
      const hasType = !!profile.contractorType;
      const hasLevel = !!profile.licenseLevel;
      const hasExperience = !!profile.contractorExperiences;
      const hasProjects = profile.contractorProjects?.length > 0;
      status['experience'] = (hasType && hasLevel && hasExperience && hasProjects) ? 'complete' : 'incomplete';
    } else if (userTypeUpper === 'HARDWARE') {
      const profile = userData?.userProfile || {};
      const hasType = !!profile.hardwareType;
      const hasBusinessType = !!profile.businessType;
      const hasExperience = !!profile.experience;
      const hasProjects = profile.hardwareProjects?.length > 0;
      status['experience'] = (hasType && hasBusinessType && hasExperience && hasProjects) ? 'complete' : 'incomplete';
    }

    // ============================================
    // CHECK ACCOUNT UPLOADS COMPLETION
    // ============================================
    const getRequiredDocs = () => {
      const accountType = userData?.accountType?.toLowerCase() || '';
      const userTypeLower = userType?.toLowerCase() || '';

      if (accountType === 'individual' && userTypeLower === 'customer') {
        return ['idFront', 'idBack', 'kraPIN'];
      }

      const docMap: Record<string, string[]> = {
        customer: ['businessPermit', 'certificateOfIncorporation', 'kraPIN'],
        fundi: ['idFront', 'idBack', 'certificate', 'kraPIN'],
        professional: ['idFront', 'idBack', 'academicCertificate', 'cv', 'kraPIN', 'practiceLicense'],
        contractor: ['businessRegistration', 'businessPermit', 'kraPIN', 'companyProfile'],
        hardware: ['certificateOfIncorporation', 'kraPIN', 'singleBusinessPermit', 'companyProfile'],
      };

      return docMap[userTypeLower] || [];
    };

    const requiredDocs = getRequiredDocs();
    const storageKey = `uploads_demo_${userData.id}`;
    const uploadedDocs = JSON.parse(localStorage.getItem(storageKey) || '{}');

    // Check if ALL required documents exist and have truthy values
    const allDocsUploaded = requiredDocs.length > 0 && requiredDocs.every(doc => {
      const value = uploadedDocs[doc];
      return value && value !== '' && value !== null && value !== undefined;
    });

    status['account-uploads'] = allDocsUploaded ? 'complete' : 'incomplete';

    return status;
  }, [userData, userType, refreshTrigger]);

  return completionStatus;
};