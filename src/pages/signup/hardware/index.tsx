/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGlobalContext } from "@/context/GlobalProvider";
import {
    initiateRegistraion,
    handleCompleteRegistration,
    resendOtp
} from "@/api/auth.api";
import { toast, Toaster } from "sonner";
import { ProviderSignupForm } from "@/components/provider-signup-form";
import GenericFooter from "@/components/generic-footer";
import { ProfileCompletionModal } from "@/components/profile 2.0/ProfileCompletionModal";

export default function HardwareSignup() {
    const navigate = useNavigate();
    const { setUser, setIsLoggedIn } = useGlobalContext();
    const [currentStep, setCurrentStep] = useState(1);
    const [showProfileCompletionModal, setShowProfileCompletionModal] = useState(false);
    const [registeredUser, setRegisteredUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        accountType: "ORGANIZATION",
        skills: "",
        profession: "",
        contractorTypes: "",
        hardwareTypes: "",
        email: "",
        phone: "",
        otpMethod: "",
        otp: "",
        firstName: "",
        lastName: "",
        gender: "male",
        organizationName: "",
        contactFirstName: "",
        contactLastName: "",
        contactPhone: "",
        contactEmail: "",
        country: "Kenya",
        county: "",
        town: "",
        subCounty: "",
        estate: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false
    });


    // const totalSteps = formData.accountType === "ORGANIZATION" ? 6 : 5;
    const totalSteps = 6;

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handleInitiateRegistration = async () => {
        const data = {
            userType: "HARDWARE",
            accountType: formData.accountType,
            email: formData.email,
            phone: formData.phone,
            otpDeliveryMethod: formData.otpMethod.toUpperCase(),
            contractorTypes: formData.contractorTypes,
            profession: formData.profession,
            skills: formData.skills,
            hardwareTypes: formData.hardwareTypes,
        };
        try {
            const response = await initiateRegistraion(data);
            if (response.data.success) {
                toast.success("OTP sent Successfully");
            } else {
                toast.error(`Failed To Send OTP: ${response.data.message}`);
            }
        } catch (error: any) {
            toast.error(`Error sending OTP: ${error.response.data.message}`);
        }
    };

    const handleResendProviderOtp = async () => {
        const data = {
            userType: "HARDWARE",
            accountType: formData.accountType,
            email: formData.email,
            phone: formData.phone,
            otpDeliveryMethod: formData.otpMethod.toUpperCase(),
            contractorTypes: formData.contractorTypes,
            profession: formData.profession,
            skills: formData.skills,
            hardwareTypes: formData.hardwareTypes,
        };
        try {
            const response = await resendOtp(data);
            if (response.data.success) {
                toast.success("OTP sent Successfully");
            } else {
                toast.error(`Failed To Send OTP: ${response.data.message}`);
            }
        } catch (error: any) {
            toast.error(`Error sending OTP: ${error.response.data.message}`);
            throw error;
        }
    };

    // const handleSubmit = async () => {
    //     const data = {
    //         email: formData.email,
    //         firstName: formData.firstName || "Pending",
    //         lastName: formData.lastName || "User",
    //         organizationName: formData.organizationName || "Pending",
    //         contactFirstName: formData.contactFirstName || "Pending",
    //         contactLastName: formData.contactLastName || "User",
    //         contactPhone: formData.contactPhone || formData.phone,
    //         contactEmail: formData.contactEmail || formData.email,
    //         country: formData.country || "Kenya",
    //         county: formData.county || "Pending",
    //         subCounty: formData.subCounty || "Pending",
    //         estate: formData.estate || "Pending",
    //         password: formData.password,
    //         gender: formData.gender || "male",
    //         state: formData.country,
    //     };
    //     try {
    //         //const response = await handleCompleteRegistration(data);
    //         const response = {
    //              data: {
    //                  success: true,
    //                  message: "Account Created Successfully (Mock)",
    //                  user: { email: formData.email, role: "HARDWARE" },
    //                  accessToken: "mock_token_123"
    //              }
    //          };
    //         if (response.data.success) {
    //             toast.success("Account Created Successfully. Redirecting to login...");
    //             localStorage.setItem(
    //                 "user",
    //                 JSON.stringify(response.data.user)
    //             );
    //             localStorage.setItem("token", response.data.accessToken);
    //             setUser(response.data.user);
    //             setIsLoggedIn(true);
    //             setTimeout(() => {
    //                 navigate("/login");
    //             }, 2000);
    //         } else {
    //             toast.error(
    //                 `Failed To Create Account: ${response.data.message}`
    //             );
    //         }
    //     } catch (error: any) {
    //         toast.error(`Error sending OTP: ${error.response.data.message}`);
    //     }
    // };
    const handleSubmit = async () => {
        // Generate a unique ID starting from 1000 to avoid conflicts with mock data (IDs 1-24)
        const existingBuilders = JSON.parse(localStorage.getItem("builders") || "[]");
        const existingUsers = JSON.parse(localStorage.getItem("mock_users_db") || "[]");

        const maxBuilderId = existingBuilders.reduce((max: number, b: any) => {
            const id = typeof b.id === 'number' ? b.id : parseInt(b.id) || 0;
            return id > max ? id : max;
        }, 999);
        const newId = maxBuilderId + 1;

        // 1. Prepare the user object for mock_users_db
        const newUser = {
            id: newId.toString(),
            email: formData.email,
            password: formData.password,
            userType: "HARDWARE",
            accountType: formData.accountType,
            phone: formData.phone,
            phoneNumber: `+254${formData.phone}`,
            profileCompleted: false,
            status: "SIGNED_UP"
        };

        // 2. Prepare the builder object for builders array
        const newBuilder = {
            id: newId,
            userType: "HARDWARE" as const,
            email: formData.email,
            phoneNumber: `+254${formData.phone}`,
            hardwareTypes: formData.hardwareTypes || "",
            accountType: "business" as const,
            adminApproved: false,
            status: "SIGNED_UP" as const,
            createdAt: new Date().toISOString(),
            firstName: undefined,
            lastName: undefined,
            organizationName: undefined,
            county: undefined,
            subCounty: undefined,
            userProfile: null
        };

        try {
            if (existingUsers.find((u: any) => u.email === newUser.email)) {
                toast.error("User with this email already exists!");
                return;
            }
            if (existingBuilders.find((b: any) => b.email === newUser.email)) {
                toast.error("User with this email already exists!");
                return;
            }

            existingUsers.push(newUser);
            localStorage.setItem("mock_users_db", JSON.stringify(existingUsers));

            existingBuilders.push(newBuilder);
            localStorage.setItem("builders", JSON.stringify(existingBuilders));

            localStorage.setItem("otpDeliveryMethod", formData.otpMethod);

            toast.success("Account created successfully. Please complete your profile.");
            setRegisteredUser({ ...newUser, builderId: newId });
            setShowProfileCompletionModal(true);

        } catch (error: any) {
            toast.error("An error occurred during mock registration");
        }
    };

    const handleProfileComplete = (profileData: any) => {
        const builderId = registeredUser?.builderId || registeredUser?.id;

        const updatedUser = {
            ...registeredUser,
            ...profileData,
            organizationName: profileData.organizationName || "",
            profileCompleted: true,
            status: "INCOMPLETE"
        };

        const existingUsers = JSON.parse(localStorage.getItem("mock_users_db") || "[]");
        const userIndex = existingUsers.findIndex((u: any) => u.email === updatedUser.email);
        if (userIndex !== -1) {
            existingUsers[userIndex] = updatedUser;
            localStorage.setItem("mock_users_db", JSON.stringify(existingUsers));
        }

        const existingBuilders = JSON.parse(localStorage.getItem("builders") || "[]");
        const builderIndex = existingBuilders.findIndex((b: any) =>
            b.id === builderId || b.id === parseInt(builderId) || b.email === updatedUser.email
        );
        if (builderIndex !== -1) {
            existingBuilders[builderIndex] = {
                ...existingBuilders[builderIndex],
                organizationName: profileData.organizationName || undefined,
                county: profileData.county || undefined,
                subCounty: profileData.subCounty || undefined,
                village: profileData.estate || undefined,
                status: "INCOMPLETE",
                userProfile: {
                    hardwareType: formData.hardwareTypes || "",
                }
            };
            localStorage.setItem("builders", JSON.stringify(existingBuilders));
        }

        // Save address to user-specific key for profile page
        const addressData = {
            country: profileData.country || "Kenya",
            county: profileData.county || "",
            subCounty: profileData.subCounty || "",
            estate: profileData.estate || profileData.town || "",
        };
        localStorage.setItem(`address_${updatedUser.id}`, JSON.stringify(addressData));

        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("token", "mock_access_token_" + updatedUser.id);
        setUser(updatedUser);
        setIsLoggedIn(true);
        toast.success("Profile completed! Redirecting to dashboard...");
        setShowProfileCompletionModal(false);
        setTimeout(() => {
            navigate("/profile");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="top-center" richColors />

            <main className="flex-1 py-8 md:py-12">
                <div className="max-w-[30rem] mx-auto">
                    <div className="mb-8">
                        <button
                            onClick={() =>
                                currentStep > 1 ? prevStep() : navigate("/")
                            }
                            className="flex items-center text-gray-600 hover:text-[#00007a] transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {currentStep > 1 ? "Back" : "Back to Home"}
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
                        <ProviderSignupForm
                            providerType="HARDWARE"
                            currentStep={currentStep}
                            formData={formData}
                            updateFormData={updateFormData}
                            nextStep={nextStep}
                            prevStep={prevStep}
                            handleInitiateRegistration={
                                handleInitiateRegistration
                            }
                            handleSubmit={handleSubmit}
                            handleResendOtp={handleResendProviderOtp}
                        />
                    </div>
                </div>
            </main>

            <ProfileCompletionModal
                isOpen={showProfileCompletionModal}
                user={registeredUser}
                accountType={"HARDWARE" as any}
                userType="HARDWARE"
                onComplete={handleProfileComplete}
                onClose={() => setShowProfileCompletionModal(false)}
            />

            <GenericFooter />
        </div>
    );
}

