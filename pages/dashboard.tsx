import React, { useState, useEffect } from 'react';
import { withAuth } from '../utils/withAuth.tsx';
import { signOut } from 'firebase/auth';
import { auth, firestore } from '../config/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import styles from '../css/styles.module.css';


// modal menu

const Modal = ({ isOpen, onClose, children }) => {
    return isOpen ? (
        <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
                {children}
            </div>
        </div>
    ) : null;
};


// dashboard page

const Dashboard = () => {

    const [currentUser, setCurrentUser] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [userImageUrl, setUserImageUrl] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
            if (user) {
                const userDocRef = doc(firestore, "users", user.uid);
                getDoc(userDocRef).then(docSnap => {
                    if (docSnap.exists()) {
                        setUserImageUrl(docSnap.data().profileImageUrl);
                    }
                });
            }
        });
        return () => unsubscribe();
    }, []);


    // logout

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };


    // change file

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };


    // update user profile:

    const updateUserProfile = async (imageUrl, fileName) => {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(firestore, "users", user.uid);
            try {
                await setDoc(userDocRef, { profileImageUrl: imageUrl, currentFileName: fileName }, { merge: true });

                // state update

                setUserImageUrl(imageUrl);
                console.log("User profile updated with image URL");
            } catch (error) {
                console.error("Error updating user profile: ", error);
            }
        }
    };


    // upload image logic

    const uploadImage = () => {
        if (!selectedFile) {
            alert('Please select a file first!');
            return;
        }

        // current file name from firestore

        const userDocRef = doc(firestore, "users", auth.currentUser.uid);
        getDoc(userDocRef).then(async docSnap => {
            if (docSnap.exists() && docSnap.data().currentFileName) {
                const currentFileName = docSnap.data().currentFileName;

                // delete current image from s3 bucket

                await fetch(`http://localhost:3001/delete-image?fileName=${encodeURIComponent(currentFileName)}`);
            }

            // uploading new image

            const backendUrl = 'http://localhost:3001/generate-presigned-url';

            const fileName = encodeURIComponent(selectedFile.name);
            const fileType = encodeURIComponent(selectedFile.type);
            const urlWithQueryParams = `${backendUrl}?fileName=${fileName}&fileType=${fileType}`;

            fetch(urlWithQueryParams)
                .then(response => response.json())
                .then(data => {
                    fetch(data.url, {
                        method: 'PUT',
                        body: selectedFile,
                        headers: {
                            'Content-Type': selectedFile.type
                        },
                    })
                        .then(response => {
                            if (response.ok) {
                                console.log('Image uploaded successfully');
                                const s3ImageUrl = `https://aws-profileimage-upload.s3.amazonaws.com/${encodeURIComponent(fileName)}`;
                                updateUserProfile(s3ImageUrl, fileName);

                                // closes modal after image upload

                                setModalOpen(false);
                            } else {
                                console.error('Upload failed');
                            }
                        })
                        .catch(error => console.error('Error uploading file:', error));
                })
                .catch(error => console.error('Error getting pre-signed URL:', error));
        });
    };


    const openModal = () => setModalOpen(true);

    return (
        <div className={styles.dashboardBackground}>
            <div className={styles.topBar}>
                <h1 className={styles.pageHeadings}>Dashboard</h1>
                <div className={styles.userSection}>
                    {currentUser && (
                        <div className={styles.userInfoContainer} onClick={openModal}>
                            {userImageUrl && (
                                <img
                                    src={userImageUrl}
                                    alt="Profile"
                                    className={styles.profileImage}
                                />
                            )}
                            <p className={styles.userEmail}>{currentUser.email}</p>
                        </div>
                    )}
                    <button className={styles.logoutButton} onClick={handleLogout}>Logout</button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                {userImageUrl ? (
                    <p className={styles.changeImagePrompt}>
                        Change your photo.
                    </p>
                ) : (
                    <p className={styles.uploadPrompt}>
                        Upload a profile photo.
                    </p>
                )}
                <input type="file" onChange={handleFileChange} className={styles.toggle_message}/>
                <button onClick={uploadImage} className={styles.uploadButton}>Upload</button>
                <button onClick={() => setModalOpen(false)} className={styles.closeButton}>Close</button>
            </Modal>
        </div>
    );
};

export default withAuth(Dashboard);