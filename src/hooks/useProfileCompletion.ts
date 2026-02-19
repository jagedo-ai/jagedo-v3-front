/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect, useCallback } from 'react';

/**
 * useProfileCompletion Hook - SIMPLIFIED VERSION
 *
 * Since users fill Account Info & Address during sign-up, those are ALWAYS complete.
 * This hook only checks:
 * - Account Uploads: Are all required documents uploaded?
 * - Experience: Are grade, experience, and projects filled?
 *
 * Props:
 * - userData: User data object
 * - userType: Type of user (FUNDI, PROFESSIONAL, CONTRACTOR, HARDWARE, CUSTOMER)
 */
export const useProfileCompletion = (userData: any, userType: string): { [key: string]: 'complete' | 'incomplete' } => {
  // State to force re-computation when localStorage changes
  const [storageVersion, setStorageVersion] = useState(0);

  // Listen for storage events (including custom events from document uploads)
  useEffect(() => {
    const handleStorageChange = () => {
      setStorageVersion(v => v + 1);
    };

    // Listen for both native storage events and custom events
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const completionStatus = useMemo((): { [key: string]: 'complete' | 'incomplete' } => {
    // If no user data, mark everything as incomplete
    const defaultStatus: { [key: string]: 'complete' | 'incomplete' } = {
      'account-info': 'complete',      // Always complete (filled at signup)
      'address': 'complete',           // Always complete (filled at signup)
      'account-uploads': 'incomplete', // Depends on document uploads
      'experience': 'incomplete',       // Depends on experience data
      'products': 'incomplete',         // Not required yet
    };
    
    if (!userData) {
      return defaultStatus;

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
    // ACCOUNT UPLOADS COMPLETION
    // ============================================
    // Get required documents based on user type
    const getRequiredDocuments = () => {
      const accountType = userData?.accountType?.toLowerCase() || '';
      const userTypeLC = userType.toLowerCase();

      // Individual customer needs: ID Front, ID Back, KRA PIN
      if (accountType === 'individual' && userTypeLC === 'customer') {
        return ['idFront', 'idBack', 'kraPIN'];
      }

      // Map of required documents per user type
      const docMap: any = {
        customer: ['businessPermit', 'certificateOfIncorporation', 'kraPIN'],
        fundi: ['idFront', 'idBack', 'certificate', 'kraPIN'],
        professional: ['idFront', 'idBack', 'academicCertificate', 'cv', 'kraPIN', 'practiceLicense'],
        contractor: ['certificateOfIncorporation', 'businessPermit', 'kraPIN', 'companyProfile'],
        hardware: ['certificateOfIncorporation', 'businessPermit', 'kraPIN', 'companyProfile'],
      };

      return docMap[userTypeLC] || [];
    };

    // Get documents uploaded from localStorage
    // Storage key format: uploads_demo_[userId]
    const uploadedDocs = JSON.parse(
      localStorage.getItem(`uploads_demo_${userData.id}`) || '{}'
    );

    // Check if ALL required documents are uploaded
    const requiredDocs = getRequiredDocuments();
    // If no docs required (edge case), mark as complete
    // Otherwise, check if every required document exists in localStorage
    const uploadsComplete = requiredDocs.length === 0 || 
      requiredDocs.every(doc => uploadedDocs[doc]);
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

    // ============================================
    // EXPERIENCE COMPLETION
    // ============================================
    // Check experience based on user type
    let experienceComplete = false;
    const userTypeUpper = userType.toUpperCase();

    if (userTypeUpper === 'CUSTOMER') {
      // CUSTOMER doesn't have experience section
      experienceComplete = true;
    } else if (userTypeUpper === 'FUNDI') {
      // FUNDI: needs grade, experience, and previousJobPhotoUrls
      const hasGrade = userData?.userProfile?.grade;
      const hasExperience = userData?.userProfile?.experience;
      const hasProjects = userData?.userProfile?.previousJobPhotoUrls &&
                          userData.userProfile.previousJobPhotoUrls.length > 0;
      experienceComplete = !!(hasGrade && hasExperience && hasProjects);
    } else if (userTypeUpper === 'PROFESSIONAL') {
      // PROFESSIONAL: needs profession, professionalLevel, yearsOfExperience, and professionalProjects
      const hasProfession = userData?.userProfile?.profession;
      const hasLevel = userData?.userProfile?.professionalLevel;
      const hasExperience = userData?.userProfile?.yearsOfExperience;
      const hasProjects = userData?.userProfile?.professionalProjects &&
                          userData.userProfile.professionalProjects.length > 0;
      experienceComplete = !!(hasProfession && hasLevel && hasExperience && hasProjects);
    } else if (userTypeUpper === 'CONTRACTOR') {
      // CONTRACTOR: needs contractorType, licenseLevel, contractorExperiences, and contractorProjects
      const hasType = userData?.userProfile?.contractorType;
      const hasLevel = userData?.userProfile?.licenseLevel;
      const hasExperience = userData?.userProfile?.contractorExperiences;
      const hasProjects = userData?.userProfile?.contractorProjects &&
                          userData.userProfile.contractorProjects.length > 0;
      experienceComplete = !!(hasType && hasLevel && hasExperience && hasProjects);
    } else if (userTypeUpper === 'HARDWARE') {
      // HARDWARE: needs hardwareType, businessType, experience, and hardwareProjects
      const hasType = userData?.userProfile?.hardwareType;
      const hasBusinessType = userData?.userProfile?.businessType;
      const hasExperience = userData?.userProfile?.experience;
      const hasProjects = userData?.userProfile?.hardwareProjects &&
                          userData.userProfile.hardwareProjects.length > 0;
      experienceComplete = !!(hasType && hasBusinessType && hasExperience && hasProjects);
    }

    // ============================================
    // RETURN STATUS FOR ALL SECTIONS
    // ============================================
    const statusObject: { [key: string]: 'complete' | 'incomplete' } = {
      'account-info': 'complete',      // Always complete (filled during signup)
      'address': 'complete',           // Always complete (filled during signup)
      'account-uploads': uploadsComplete ? 'complete' : 'incomplete',
      'experience': experienceComplete ? 'complete' : 'incomplete',
      'products': 'incomplete',         // Not tracked yet
    };
    
    return statusObject;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, userType, storageVersion]);

  return completionStatus;
};

export type CompletionStatus = 'complete' | 'incomplete';