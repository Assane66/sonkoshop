// LoginPage has been removed as Firebase Authentication is no longer used.
// The admin section is now directly accessible.

export default function LoginPage() {
  // This page is no longer functional due to removal of Firebase Auth.
  // It can be deleted from the project.
  if (typeof window !== 'undefined') {
    // window.location.href = '/admin'; // Or redirect to home
  }
  return (
    <div>
      <p>Login functionality has been removed. The admin section is directly accessible if it exists.</p>
    </div>
  );
}
