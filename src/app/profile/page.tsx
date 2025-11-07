'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
        } else {
          alert('Failed to fetch profile.');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('An error occurred while fetching profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="text-center">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center">
        <h2>Access Denied</h2>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header">User Profile</div>
          <div className="card-body">
            <h3 className="card-title">Welcome, {user.message.split(', ')[1].replace('!', '')}!</h3>
            <p className="card-text">{user.message}</p>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
