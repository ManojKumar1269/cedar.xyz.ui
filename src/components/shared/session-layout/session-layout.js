function SessionLayout({ children }) {
  return (
    <div className="container d-flex justify-content-center align-items-center h-100">
      {children}
    </div>
  );
}

export default SessionLayout;