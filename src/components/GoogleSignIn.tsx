import { useMemo, Component, type ReactNode } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import axios from "axios";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// The shape your backend expects
type TokenRequest = {
    credential: string;
    clientId: string;
    token?: string;
};

// Error boundary to catch Google SDK errors
class GoogleSignInErrorBoundary extends Component<
    { children: ReactNode; fallback: ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        console.warn('GoogleSignIn error caught:', error.message);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

export default function GoogleSignIn() {
    const navigate = useNavigate();

    const nonce = useMemo(() => crypto.randomUUID(), []);

    const redirectUser = (userType) => {
        setTimeout(() => {
            switch (userType?.toLowerCase()) {
                case "customer": navigate("/dashboard/customer"); break;
                case "fundi": navigate("/dashboard/fundi"); break;
                case "professional": navigate("/dashboard/professional"); break;
                case "contractor": navigate("/dashboard/contractor"); break;
                case "hardware": navigate("/dashboard/hardware"); break;
                case "admin": navigate("/dashboard/admin"); break;
                default: navigate("/");
            }
        }, 1500);
    };

    const handleSuccess = async (res: CredentialResponse) => {
        console.log("Google Res: ", res);
        const idToken = res?.credential;
        if (!idToken) {
            toast.error('No credential from Google');
            return;
        }

        const payload: TokenRequest = {
            credential: idToken,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID!,
            token: idToken
        };

        try {
            // POST to your backend verification endpoint
            const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/google/login`, payload, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.status !== 200) {
                const e = response.data || { message: 'unknown' };
                toast.error('Server rejected Google token: ' + (e?.message || response.status));
                return;
            }

            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.accessToken);
            toast.success("Login successful! Redirecting to dashboard...");
            redirectUser(response.data.user.userType);
        } catch (err) {
            const errorMessage = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : (err as Error).message;
            toast.error('Login failed: ' + errorMessage);
        }
    };

    const handleError = () => toast.error('Google Sign-In failed');

    // Check if Google Client ID is configured
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
        return (
            <div className="w-full flex items-center justify-center">
                <div className="text-gray-400 text-sm">Google Sign-In unavailable</div>
            </div>
        );
    }

    const fallbackUI = (
        <div className="w-full flex items-center justify-center">
            <div className="text-gray-400 text-sm">Google Sign-In unavailable</div>
        </div>
    );

    return (
        <GoogleSignInErrorBoundary fallback={fallbackUI}>
            <div className="w-full flex items-center justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap={false}
                    nonce={nonce}
                    ux_mode="popup"
                    text="continue_with"
                />
            </div>
        </GoogleSignInErrorBoundary>
    );
}