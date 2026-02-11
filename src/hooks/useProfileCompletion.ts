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
      let expComplete = !!(profile.grade && profile.experience && profile.previousJobPhotoUrls?.length > 0);
      // Fallback: check localStorage experience data
      if (!expComplete) {
        try {
          const saved = localStorage.getItem(`fundi_experience_${userData.id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            expComplete = !!parsed.grade && !!parsed.experience && parsed.attachments?.some((a: any) => a.projectName && a.files?.length > 0);
          }
        } catch { /* ignore */ }
      }
      status['experience'] = expComplete ? 'complete' : 'incomplete';
    } else if (userTypeUpper === 'PROFESSIONAL') {
      const profile = userData?.userProfile || {};
      let expComplete = !!(profile.profession && profile.professionalLevel && profile.yearsOfExperience && profile.professionalProjects?.length > 0);
      // Fallback: check localStorage experience data
      if (!expComplete) {
        try {
          const saved = localStorage.getItem(`professional_experience_${userData.id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            expComplete = !!parsed.category && !!parsed.level && !!parsed.experience && parsed.attachments?.some((a: any) => a.projectName && a.files?.length > 0);
          }
        } catch { /* ignore */ }
      }
      status['experience'] = expComplete ? 'complete' : 'incomplete';
    } else if (userTypeUpper === 'CONTRACTOR') {
      const profile = userData?.userProfile || {};
      let expComplete = !!(profile.contractorType && profile.licenseLevel && profile.contractorExperiences && profile.contractorProjects?.length > 0);
      // Fallback: check localStorage experience data
      if (!expComplete) {
        try {
          const saved = localStorage.getItem(`contractorExperience_${userData.id}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            expComplete = parsed.categories?.length > 0 && parsed.categories.every((c: any) => c.category && c.categoryClass && c.yearsOfExperience);
          }
        } catch { /* ignore */ }
      }
      status['experience'] = expComplete ? 'complete' : 'incomplete';
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
        contractor: ['certificateOfIncorporation', 'businessPermit', 'kraPIN', 'companyProfile'],
        hardware: ['certificateOfIncorporation', 'businessPermit', 'kraPIN', 'companyProfile'],
      };

      return docMap[userTypeLower] || [];
    };

    const requiredDocs = getRequiredDocs();
    const storageKey = `uploads_demo_${userData.id}`;
    const uploadedDocs = JSON.parse(localStorage.getItem(storageKey) || '{}');

    // Check if ALL required documents exist, have truthy values, and are not rejected/returned
    const allDocsUploaded = requiredDocs.length > 0 && requiredDocs.every(doc => {
      const value = uploadedDocs[doc];
      if (!value || value === '' || value === null || value === undefined) return false;
      // If the document has a status field, check it's not rejected or returned
      if (typeof value === 'object' && value.status) {
        return value.status !== 'rejected' && value.status !== 'reupload_requested';
      }
      return true;
    });

    status['account-uploads'] = allDocsUploaded ? 'complete' : 'incomplete';

    return status;
  }, [userData, userType, refreshTrigger]);

  return completionStatus;
};