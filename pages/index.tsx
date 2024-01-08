import React, { useState } from 'react';
import Login from './login.tsx';
import Signup from './signup.tsx';
import styles from '../css/styles.module.css';


// toggle between login and signup

export default function Home() {

    const [isLoginView, setIsLoginView] = useState(true);

    return (
        <div className={ styles.indexPageBackground }>
            <h1 className={styles.pageHeadings}>Public Policy Challenge</h1>
            {isLoginView ? (
                <Login onToggleView={() => setIsLoginView(false)} />
            ) : (
                <Signup onToggleView={() => setIsLoginView(true)} />
            )}
        </div>
    );
}
