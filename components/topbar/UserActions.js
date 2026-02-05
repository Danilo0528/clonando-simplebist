'use client';

import UserProfile from './UserProfile';
import GuestMenu from './GuestMenu';

const UserActions = ({ user }) => {

  // The `user` object is now passed down as a prop from the server-rendered TopBar.
  // If the user exists, we show their profile. Otherwise, we show the guest menu.
  return user ? (
    <UserProfile user={user} />
  ) : (
    <GuestMenu />
  );
};

export default UserActions;
