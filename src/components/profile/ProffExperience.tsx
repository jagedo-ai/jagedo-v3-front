/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-nocheck

import { useState, useMemo, useEffect } from "react";
import toast from 'react-hot-toast';
import { XMarkIcon, EyeIcon } from "@heroicons/react/24/outline";
import useAxiosWithAuth from "@/utils/axiosInterceptor";
import { updateProfessionalExperience } from "@/api/experience.api";
import { getProviderProfile } from "@/api/provider.api";
import { uploadFile } from "@/utils/fileUpload";
import { useGlobalContext } from "@/context/GlobalProvider";

type FileOrUrl = File | string;

interface AttachmentRow {
    id: number;
    projectName: string;
    files: FileOrUrl[];
}

interface ProjectPayload {
    projectName: string;
    fileUrl: string;
}

export interface ProfessionalExperiencePayload {
    professionalProjects: ProjectPayload[];
    level: string;
    yearsOfExperience: string;
    category: string;
    specialization: string;
}

const PROJECT_REQUIREMENTS = {
    senior: 5,
    professional: 3,
    graduate: 1,
    student: 0,
};


// Mapping from signup slugs to display names for professional categories
const PROFESSION_SLUG_TO_DISPLAY: Record<string, string> = {
    "project-manager": "Project Manager",
    "architect": "Architect",
    "water-engineer": "Water Engineer",
    "roads-engineer": "Roads Engineer",
    "structural-engineer": "Structural Engineer",
    "mechanical-engineer": "Mechanical Engineer",
    "electrical-engineer": "Electrical Engineer",
    "surveyor": "Surveyor",
    "quantity-surveyor": "Quantity Surveyor",
    "construction-manager": "Construction Manager",
    "environment-officer": "Environment Officer",
    "geotechnical-engineer": "Geotechnical Engineer",
    "geologist": "Geologist",
    "hydrologist": "Hydrologist",
    "interior-designer": "Interior Designer",
    "land-surveyor": "Land Surveyor",
    "landscape-architect": "Landscape Architect",
    "safety-officer": "Safety Officer",
    "topo-surveyor": "Topo Surveyor",
};

const resolveProfession = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    // Check if it's already a known display name (key in SPECIALIZATIONS_BY_CATEGORY)
    if (SPECIALIZATIONS_BY_CATEGORY[trimmed]) return trimmed;
    // Try slug mapping
    if (PROFESSION_SLUG_TO_DISPLAY[trimmed]) return PROFESSION_SLUG_TO_DISPLAY[trimmed];
    // Fallback: title-case the slug
    if (trimmed.includes("-")) {
        return trimmed.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const SPECIALIZATIONS_BY_CATEGORY: Record<string, string[]> = {
    "Project Manager": [
        "Construction Project Management", "Infrastructure Projects", "Residential Development",
        "Commercial Development", "Industrial Projects", "Government Projects",
        "Real Estate Development", "Renovation & Remodeling", "Green Building Projects", "Multi-site Management",
    ],
    "Architect": [
        "Residential Architecture", "Commercial Architecture", "Industrial Architecture",
        "Landscape Architecture", "Interior Architecture", "Urban Planning",
        "Sustainable Design", "Historic Preservation", "Healthcare Facilities", "Educational Facilities",
    ],
    "Water Engineer": [
        "Water Supply Systems", "Wastewater Treatment", "Stormwater Management",
        "Irrigation Engineering", "Hydraulic Structures", "Pipeline Engineering",
        "Water Resources Management", "Flood Control", "Desalination Systems", "Environmental Water Solutions",
    ],
    "Roads Engineer": [
        "Highway Design", "Urban Road Design", "Pavement Engineering", "Traffic Engineering",
        "Bridge Engineering", "Road Rehabilitation", "Drainage Design",
        "Survey & Mapping", "Construction Supervision", "Road Safety Engineering",
    ],
    "Structural Engineer": [
        "Building Structures", "Bridge Structures", "Industrial Structures", "Concrete Structures",
        "Steel Structures", "Foundation Engineering", "Seismic Design",
        "Structural Assessment", "Retrofit & Rehabilitation", "Temporary Structures",
    ],
    "Mechanical Engineer": [
        "HVAC Systems", "Plumbing Systems", "Fire Protection Systems", "Elevator & Escalator Systems",
        "Industrial Machinery", "Energy Systems", "Building Automation",
        "Refrigeration Systems", "Ventilation Design", "Mechanical Maintenance",
    ],
    "Electrical Engineer": [
        "Power Distribution", "Lighting Design", "Building Electrical Systems", "Industrial Electrical",
        "Renewable Energy Systems", "Control Systems", "Telecommunications",
        "Security Systems", "Fire Alarm Systems", "Energy Management",
    ],
    ],
    "Mechanical Engineer": [
        "HVAC Systems", "Plumbing Systems", "Fire Protection Systems", "Elevator & Escalator Systems",
        "Industrial Machinery", "Energy Systems", "Building Automation",
        "Refrigeration Systems", "Ventilation Design", "Mechanical Maintenance",
    ],
    "Electrical Engineer": [
        "Power Distribution", "Lighting Design", "Building Electrical Systems", "Industrial Electrical",
        "Renewable Energy Systems", "Control Systems", "Telecommunications",
        "Security Systems", "Fire Alarm Systems", "Energy Management",
    ],
    "Surveyor": [
        "Land Surveying", "Topographic Surveys", "Construction Surveying", "Cadastral Surveys",
        "Engineering Surveys", "GPS & GIS Mapping", "Hydrographic Surveys",
        "Quantity Surveying", "Boundary Surveys", "As-built Surveys",
    ],
    "Quantity Surveyor": [
        "Cost Estimation", "Bill of Quantities", "Contract Administration", "Value Engineering",
        "Project Cost Control", "Procurement Management", "Final Account Settlement",
        "Risk Assessment", "Feasibility Studies", "Life Cycle Costing",
    ],
    "Construction Manager": ["Site Management", "Project Coordination", "Resource Planning", "Quality Control"],
    "Environment Officer": ["Environmental Impact", "Compliance", "Waste Management", "Sustainability"],
    "Geotechnical Engineer": ["Soil Investigation", "Foundation Design", "Slope Stability", "Ground Improvement"],
    "Geologist": ["Site Investigation", "Rock Mechanics", "Hydrogeology", "Mineral Exploration"],
    "Hydrologist": ["Water Resources", "Flood Analysis", "Watershed Management", "Groundwater Studies"],
    "Interior Designer": ["Residential Interiors", "Commercial Interiors", "Hospitality Design", "Office Design"],
    "Land Surveyor": ["Cadastral Surveys", "Topographic Surveys", "Boundary Surveys", "GPS Mapping"],
    "Landscape Architect": ["Landscape Design", "Urban Landscaping", "Park Design", "Environmental Restoration"],
    "Safety Officer": ["Construction Safety", "Risk Assessment", "Safety Audits", "Emergency Planning"],
    "Topo Surveyor": ["Topographic Mapping", "Digital Terrain Models", "GIS Surveys", "Contour Mapping"],
};

const ProffExperience = () => {
    const axiosInstance = useAxiosWithAuth(import.meta.env.VITE_SERVER_URL);
    const { logout, user: contextUser, setUser } = useGlobalContext();
    const user = contextUser || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null);
    // Read profession from user data (set during signup)
    const userProfession = user?.userProfile?.profession || user?.profession || "";
    const [specialization, setSpecialization] = useState(userProfession || "");
    const userProfessionRaw = user?.userProfile?.profession || user?.profession || "";
    const userProfession = resolveProfession(userProfessionRaw);
    const [specialization, setSpecialization] = useState("");
    // Prefilled fields
    const [category, setCategory] = useState(userProfession || "");
    const [level, setLevel] = useState("");
    const [experience, setExperience] = useState("");
    const [attachments, setAttachments] = useState<AttachmentRow[]>([]);

    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    const isReadOnly = user?.adminApproved === true;

    const rowsToShow = useMemo(() => {
        const levelKey = level.toLowerCase().trim() as keyof typeof PROJECT_REQUIREMENTS;
        return PROJECT_REQUIREMENTS[levelKey] ?? 0;
    }, [level]);

    // Load projects from user-specific localStorage or start empty
    useEffect(() => {
        const userId = user?.id;
        const storageKey = userId ? `professional_experience_${userId}` : "professional_experience";

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                const profFallback = user?.userProfile?.profession || user?.profession || "";
                setCategory(parsed.category || profFallback);
                const profFallback = resolveProfession(user?.userProfile?.profession || user?.profession || "");
                setCategory(resolveProfession(parsed.category) || profFallback);
                setSpecialization(parsed.specialization || "");
                setLevel(parsed.level || "");
                setExperience(parsed.experience || "");
                if (parsed.attachments && parsed.attachments.length > 0) {
                    setAttachments(parsed.attachments);
                    setIsLoadingProfile(false);
                    return;
                }
            }
        } catch (e) {
            console.error("Failed to load professional experience:", e);
        }

        // Start with empty project rows for new users
        const emptyProjects: AttachmentRow[] = [];
        for (let i = 1; i <= 5; i++) {
            emptyProjects.push({ id: i, projectName: "", files: [] });
        }

        setAttachments(emptyProjects);
        setIsLoadingProfile(false);
    }, [user?.id]);

    // Save to user-specific localStorage when data changes (auto-save for form fields only)
    useEffect(() => {
        const userId = user?.id;
        if (!userId || isLoadingProfile) return;

        const storageKey = `professional_experience_${userId}`;

        // Convert File objects to serializable format for auto-save
        const serializableAttachments = attachments.map(att => ({
            ...att,
            files: att.files.map(file => {
                if (file instanceof File) {
                    return {
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        isFile: true,
                    };
                }
                return file;
            }),
        }));

        const dataToSave = {
            category,
            specialization,
            level,
            experience,
            attachments: serializableAttachments,
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }, [category, specialization, level, experience, attachments, user?.id, isLoadingProfile]);

    const updateExperienceOnServer = async (
        currentLevel: string,
        currentExperience: string,
        currentAttachments: AttachmentRow[]
    ) => {
        const providedProjects = currentAttachments.slice(0, rowsToShow).filter(p => p.projectName.trim() !== "" && p.files.length > 0);

        const projectPayloadPromises = providedProjects.flatMap(project =>
            project.files.map(file => {
                if (file instanceof File) {
                    return uploadFile(file).then(uploaded => ({
                        projectName: project.projectName.trim(),
                        fileUrl: uploaded.url,
                    }));
                }
                return Promise.resolve({
                    projectName: project.projectName.trim(),
                    fileUrl: file as string,
                });
            })
        );

        const professionalProjects = await Promise.all(projectPayloadPromises);
        const payload: ProfessionalExperiencePayload = {
            category,
            specialization,
            level: currentLevel,
            yearsOfExperience: currentExperience,
            professionalProjects,
        };

        await updateProfessionalExperience(axiosInstance, payload);
    };

    const handleFileChange = (rowId: number, file: File | null) => {
        if (!file) return;
        setAttachments((prev) =>
            prev.map((item) => item.id === rowId && item.files.length < 3 ? { ...item, files: [...item.files, file] } : item)
        );
    };

    const handleProjectNameChange = (rowId: number, value: string) => {
        setAttachments((prev) => prev.map((item) => item.id === rowId ? { ...item, projectName: value } : item));
    };

    const removeFile = (rowId: number, fileIndex: number) => {
        const updatedAttachments = attachments.map((item) => {
            if (item.id === rowId) {
                const newFiles = [...item.files];
                newFiles.splice(fileIndex, 1);
                return { ...item, files: newFiles };
            }
            return item;
        });

        setAttachments(updatedAttachments);
        toast.success('File removed successfully!');
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isReadOnly) return toast.error("Your approved profile cannot be modified.");
        if (!level || !experience) return toast.error("Please select a Level and your Years of Experience.");

        // For student level, no projects required
        if (rowsToShow > 0) {
            const providedProjects = attachments.slice(0, rowsToShow).filter(p => p.projectName.trim() !== "" && p.files.length > 0);
            if (providedProjects.length < rowsToShow) return toast.error(`Please provide all ${rowsToShow} required projects.`);
        }

        setIsSubmitting(true);
        try {
            // Save to localStorage (mock mode)
            const userId = user?.id;
            const storageKey = userId ? `professional_experience_${userId}` : "professional_experience";

            // Convert File objects to serializable format
            const serializableAttachments = attachments.map(att => ({
                ...att,
                files: att.files.map(file => {
                    if (file instanceof File) {
                        return {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            isFile: true,
                        };
                    }
                    return file;
                }),
            }));

            const dataToSave = {
                category,
                specialization,
                level,
                experience,
                attachments: serializableAttachments,
                timestamp: new Date().toISOString(),
            };

            localStorage.setItem(storageKey, JSON.stringify(dataToSave));

            // Update user context so sidebar status recalculates
            setUser((prev: any) => ({
                ...prev,
                userProfile: {
                    ...prev?.userProfile,
                    profession: category,
                    specialization,
                    professionalLevel: level,
                    yearsOfExperience: experience,
                    professionalProjects: attachments.slice(0, rowsToShow).filter(a => a.projectName.trim() && a.files.length > 0).map(a => ({
                        projectName: a.projectName,
                        fileUrl: typeof a.files[0] === 'string' ? a.files[0] : a.files[0]?.name || '',
                    })),
                },
            }));

            window.dispatchEvent(new Event("storage"));

            toast.success('Experience saved successfully!');
            setSubmitted(true);
        } catch (err) {
            console.error("Submission failed:", err);
            toast.error("Failed to save experience");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingProfile) return <div className="p-8 text-center text-gray-600">Loading professional profile...</div>;

    const inputStyles = "w-full p-3 border rounded-lg disabled:bg-gray-100 disabled:cursor-not-allowed";

    return (
        <div className="flex">
            <div className="p-2 sm:p-4 md:p-8 bg-gray-50 min-h-screen w-full">
                <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 max-w-4xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-800">Professional Experience</h1>
                    {!submitted ? (
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {!isReadOnly && (
                                <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                            <input type="text" value={category} readOnly className="w-full p-3 bg-gray-200 border rounded-lg" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                                            <select
                                                value={specialization}
                                                onChange={(e) => setSpecialization(e.target.value)}
                                                disabled={isReadOnly}
                                                className={inputStyles}
                                            >
                                                <option value="">Select specialization</option>
                                                {SPECIALIZATIONS_BY_CATEGORY[category]?.map(spec => (
                                                    <option key={spec} value={spec}>
                                                        {spec}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                                            <select
                                                value={level}
                                                onChange={(e) => setLevel(e.target.value)}
                                                disabled={isReadOnly}
                                                className={inputStyles}
                                            >
                                                <option value="">Select level</option>
                                                <option value="Senior">Senior</option>
                                                <option value="Professional">Professional</option>
                                                <option value="Graduate">Graduate</option>
                                                <option value="Student">Student</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                                            <select
                                                value={experience}
                                                onChange={(e) => setExperience(e.target.value)}
                                                disabled={isReadOnly}
                                                className={inputStyles}
                                            >
                                                <option value="">Select experience</option>
                                                <option value="15+ years">15+ years</option>
                                                <option value="10-15 years">10-15 years</option>
                                                <option value="5-10 years">5-10 years</option>
                                                <option value="3-5 years">3-5 years</option>
                                                <option value="1-3 years">1-3 years</option>
                                                <option value="Less than 1 year">Less than 1 year</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="hidden md:table-header-group">
                                            <tr className="bg-gray-100">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-1/12">No.</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-4/12">Project Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 w-7/12">Project Files</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 md:divide-y">
                                            {attachments.slice(0, rowsToShow).map((row) => (
                                                <tr key={row.id} className="block md:table-row mb-6 md:mb-0 p-4 md:p-0 rounded-lg md:rounded-none bg-white md:bg-transparent shadow-md md:shadow-none relative md:hover:bg-gray-50">
                                                    <td className="absolute top-3 left-3 h-8 w-8 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full font-bold md:relative md:top-auto md:left-auto md:h-auto md:w-auto md:bg-transparent md:font-normal md:px-6 md:py-4 md:text-gray-500">{row.id}</td>
                                                    <td className="block md:table-cell pt-12 md:pt-0 md:px-6 md:py-4">
                                                        <input type="text" placeholder="Enter project name" value={row.projectName} onChange={(e) => handleProjectNameChange(row.id, e.target.value)} className="w-full p-2 border rounded-lg mt-1 md:mt-0 disabled:bg-gray-100 disabled:cursor-not-allowed" disabled={isSubmitting || isReadOnly} />
                                                    </td>
                                                    <td className="block md:table-cell pt-4 md:pt-0 md:px-6 md:py-4">
                                                        <div className="space-y-2 mt-1 md:mt-0">
                                                            {row.files.map((file, index) => {
                                                                const isUrl = typeof file === 'string';
                                                                const isFileObject = file instanceof File;
                                                                const isSerializedFile = typeof file === 'object' && file !== null && 'isFile' in file;
                                                                const fileName = isUrl
                                                                    ? new URL(file).pathname.split('/').pop()
                                                                    : isFileObject
                                                                        ? file.name
                                                                        : isSerializedFile
                                                                            ? (file as any).name
                                                                            : 'Unknown file';
                                                                return (
                                                                    <div key={index} className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded-lg">
                                                                        <span className="text-sm text-gray-700 truncate" title={fileName}>{fileName}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            {isUrl && <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600"><EyeIcon className="w-5 h-5" /></a>}
                                                                            {!isReadOnly && <button type="button" onClick={() => removeFile(row.id, index)} className="text-red-500 hover:text-red-700" disabled={isSubmitting}><XMarkIcon className="w-5 h-5" /></button>}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                            {!isReadOnly && row.files.length < 3 && (
                                                                <input
                                                                    type="file"
                                                                    onChange={(e) => handleFileChange(row.id, e.target.files?.[0] || null)}
                                                                    disabled={isSubmitting}
                                                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 transition-colors cursor-pointer"
                                                                />
                                                            )}
                                                            {!isReadOnly && row.files.length >= 3 && (
                                                                <p className="text-xs text-gray-500">Maximum 3 files reached</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {!isReadOnly && (
                                <div className="mt-6 text-center md:text-right">
                                    <button type="submit" className="w-full md:w-auto bg-blue-800 text-white px-8 py-3 rounded-md hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting..." : "Submit Experience"}
                                    </button>
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="space-y-8 text-center p-4">
                            <div className="bg-green-50 border p-6 rounded-lg">
                                <h2 className="text-xl md:text-2xl font-bold text-green-800">Submission Successful!</h2>
                                <p className="text-green-700 mt-2">Your professional experience has been updated. You will be logged out.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProffExperience;









