import GoogleLoginButton from "../../components/auth/GoogleLoginButton";

function LoginPage() {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#ffffff",
    },
    logoContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "2rem",
    },
    logo: {
      width: "160px",
      marginBottom: "1rem",
      marginRight: "1rem",
    },
    brandName: {
      fontSize: "24px",
      fontWeight: "bold",
    },
    message: {
      marginTop: "2rem",
      fontSize: "14px",
      color: "#666",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container} className="login-container">
      <div style={styles.logoContainer}>
        <img src="/new-logo.png" alt="ONRANK Logo" style={styles.logo} />
        <div style={styles.brandName}>onRank</div>
      </div>

      <GoogleLoginButton />

      <div style={styles.message}>
        기업하시면 저희 서비스 약관 및 개인정보 보호정책에 동의하게 됩니다.
      </div>
    </div>
  );
}

export default LoginPage;
