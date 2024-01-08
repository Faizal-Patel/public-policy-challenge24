// higher-order component for user authentication
// protects routes if unauthorized

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';


export const withAuth = (WrappedComponent) => {

    return (props) => {
        const router = useRouter();
        useEffect(() => {
            try {
                const auth = getAuth();
                const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
                    if (!user) {
                        router.push('/');
                    }
                });
                return () => unsubscribe();
            } catch (error) {
                console.error('Authentication error:', error);
            }
        }, [router]);

        //if user is authenticated:

        return <WrappedComponent {...props} />;
    };
};