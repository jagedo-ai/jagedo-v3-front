//@ts-nocheck
import { useState, useMemo, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
} from "@material-tailwind/react";
import {
  FaUser,
  FaHome,
  FaBoxes,
  FaBriefcase,
  FaShoppingCart,
  FaArrowLeft,
  FaClock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function ProfileSide({ activeComponent, setActiveComponent, user }) {
  const navigate = useNavigate();


  const [rerender, setRerender] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage event detected - updating status');
      setRerender(prev => prev + 1);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const completionStatus = useMemo((): { [key: string]: 'complete' | 'incomplete' } => {

    console.log('Recalculating completion status', rerender);

    const userType = user?.userType?.toLowerCase() || '';


    const defaultStatus: { [key: string]: 'complete' | 'incomplete' } = {
      'Account Info': 'complete',
      'Address': 'complete',
      'Account Uploads': 'incomplete',
      'Experience': 'incomplete',
      'Products': 'incomplete',
      'Activities': 'complete',
    };


    const getRequiredDocuments = () => {
      const accountType = user?.accountType?.toLowerCase() || '';
      if (accountType === 'individual' && userType === 'customer') {
        return ['idFront', 'idBack', 'kraPIN'];
      }
      const docMap: any = {
        customer: ['businessPermit', 'certificateOfIncorporation', 'kraPIN'],
        fundi: ['idFrontUrl', 'idBackUrl', 'certificateUrl', 'kraPIN'],
        professional: ['idFrontUrl', 'idBackUrl', 'academicCertificateUrl', 'cvUrl', 'kraPIN'],
        contractor: ['businessRegistration', 'businessPermit', 'kraPIN', 'companyProfile'],
        hardware: ['businessRegistration', 'kraPIN', 'singleBusinessPermit', 'companyProfile'],
      };
      return docMap[userType] || [];
    };

    const uploadedDocs = JSON.parse(localStorage.getItem(`uploads_demo_${user?.id}`) || '{}');
    console.log('Uploaded docs:', uploadedDocs);
    const requiredDocs = getRequiredDocuments();
    const uploadsComplete = requiredDocs.length === 0 || requiredDocs.every(doc => uploadedDocs[doc]);
    console.log('Uploads complete:', uploadsComplete, 'Required:', requiredDocs, 'Uploaded:', uploadedDocs);


    let experienceComplete = false;
    if (userType !== 'customer' && userType !== 'hardware') {
      const hasGrade = user?.userProfile?.grade;
      const hasExperience = user?.userProfile?.experience;
      const hasProjects = user?.userProfile?.previousJobPhotoUrls && user.userProfile.previousJobPhotoUrls.length > 0;
      experienceComplete = hasGrade && hasExperience && hasProjects;
    } else {
      experienceComplete = true;
    }

    return {
      'Account Info': 'complete',
      'Address': 'complete',
      'Account Uploads': uploadsComplete ? 'complete' : 'incomplete',
      'Experience': experienceComplete ? 'complete' : 'incomplete',
      'Products': 'incomplete',
      'Activities': 'complete',
    };
  }, [user?.id, user?.accountType, user?.userType, user?.userProfile, rerender]);

  const handleBack = () => {
    navigate(-1);
  };


  const baseNavItems = [
    {
      id: "Account Info",
      label: "Account Info",
      icon: <FaUser className="h-5 w-5 text-blue-600" />,
    },
    {
      id: "Address",
      label: "Address",
      icon: <FaHome className="h-5 w-5 text-green-600" />,
    },
    {
      id: "Account Uploads",
      label: "Account Uploads",
      icon: <FaBoxes className="h-5 w-5 text-purple-600" />,
    },
  ];

  const experienceItem = {
    id: "Experience",
    label: "Experience",
    icon: <FaBriefcase className="h-5 w-5 text-yellow-600" />,
  };

  const productsItem = {
    id: "Products",
    label: "Products",
    icon: <FaShoppingCart className="h-5 w-5 text-red-600" />,
  };

  const activitiesItem = {
    id: "Activities",
    label: "Activities",
    icon: <FaClock className="h-5 w-5 text-red-600" />,
  };

  const userType = user?.userType?.toLowerCase();
  const verified = user?.adminApproved;


  const filteredBaseNavItems = baseNavItems.filter(
    (item) => !(userType === "admin" && item.id === "Account Uploads")
  );



  const finalNavItems = [];


  finalNavItems.push(
    filteredBaseNavItems.find(i => i.id === "Account Info"),
    filteredBaseNavItems.find(i => i.id === "Address"),
  );


  if (userType !== "customer" && userType !== "hardware" && userType !== "admin") {
    finalNavItems.push(experienceItem);
  }


  const uploadsItem = filteredBaseNavItems.find(i => i.id === "Account Uploads");
  if (uploadsItem) finalNavItems.push(uploadsItem);


  if ((userType === "professional" || userType === "fundi") && verified) {
    finalNavItems.push(productsItem);
  }


  finalNavItems.push(activitiesItem);

  return (
    <Card className="fixed top-0 bottom-0 left-0 w-16 sm:w-64 lg:w-80 shadow-xl rounded-r-xl bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center justify-center sm:justify-start w-full gap-3 text-gray-700 hover:text-blue-600 transition-colors mb-6 p-2 rounded-lg hover:bg-gray-100"
        >
          <FaArrowLeft className="h-5 w-5" />
          <span className="font-semibold hidden sm:inline">Back</span>
        </button>

        <div className="text-center hidden sm:block">
          <Typography variant="h5" color="blue-gray" className="font-bold">
            Profile Management
          </Typography>
          <Typography variant="small" color="gray" className="mt-1">
            Manage your account settings
          </Typography>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 scrollbar-hide">
        <List className="space-y-1">
          {finalNavItems.filter(Boolean).map((item) => {
            const isActive = activeComponent === item.id;
            const status = completionStatus[item.id] || 'incomplete';
            const isComplete = status === 'complete';
            const showStatus = item.id !== 'Activities';

            return (
              <ListItem
                key={item.id}
                onClick={() => setActiveComponent(item.id)}
                className={`hover:bg-blue-50 transition-all duration-200 cursor-pointer flex items-center gap-4 rounded-xl px-4 py-3 ${isActive
                  ? "bg-blue-100 text-blue-700 font-bold"
                  : "text-gray-700"
                  }`}
              >
                <ListItemPrefix>
                  <div className="p-1">
                    {item.icon}
                  </div>
                </ListItemPrefix>

                <span className="hidden sm:inline text-sm font-medium flex-1">
                  {item.label}
                </span>

                {showStatus && (
                  <span className={`hidden sm:inline ml-auto text-xs font-semibold ${isComplete ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {isComplete ? 'Complete' : 'Incomplete'}
                  </span>
                )}
              </ListItem>
            );
          })}
        </List>
      </div>
    </Card>
  );
}

export default ProfileSide;
