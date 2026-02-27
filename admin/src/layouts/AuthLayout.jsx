const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#141414] transition-colors duration-300">
      <div className="flex justify-center items-center min-h-[calc(100vh-4px)] px-4 py-12">
        <div className="w-full max-w-[380px]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
