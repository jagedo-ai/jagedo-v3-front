import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PreLoader from "./components/preloader";

import generalRoutes from "./routes/general-routes/general-routes";
import adminRoutes from "./routes/admin/admin-routes";
import NotFound from "./pages/not-found/NotFound";
import signupsRoutes from "./routes/auth/login-and-signups-routes";
// import queRoutes from "./routes/que/que-routes";
import shopAppRoutes from "./routes/shopapp/shopapp-routes";
import dataAnalyticsRoutes from "./routes/data-analytics/data-analytics-routes";


function App() {
  return (
      <Suspense fallback={<PreLoader/>}>
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            // duration: 3000,
            /*
            style: {
              background: "#333",
              color: "#fff",
              fontSize: "16px",
              padding: "16px",
              borderRadius: "8px",
            },
            */
            success: {
              duration: 3000,
              style: {
                background: "#4caf50",
                color: "#fff",
                fontSize: "16px",
                padding: "16px",
                borderRadius: "8px",
              },
            },
            error: {
              duration: 3000,
              style: {
                background: "#f44336",
                color: "#fff",
                fontSize: "16px",
                padding: "16px",
                borderRadius: "8px",
              },
            },
            loading: {
              duration: 3000,
              style: {
                background: "#2196F3",
                color: "#fff",
                fontSize: "16px",
                padding: "16px",
                borderRadius: "8px",
              },
            },
          }}
          />
        <Routes>
          {generalRoutes}
          {adminRoutes}
          
          {shopAppRoutes}
          {/* {queRoutes} */}
          {signupsRoutes}
          {dataAnalyticsRoutes}
          
          <Route path="*" element={<NotFound/>} />
        </Routes>
      </Suspense>
  );
}

export default App;
