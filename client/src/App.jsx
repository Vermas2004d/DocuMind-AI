import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

function App() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/google`,
        {
          credential: credentialResponse.credential,
        }
      );

      console.log("Backend response:", response.data);
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data || error.message
      );
    }
  };

  const handleError = () => {
    console.log("Google login failed");
  };

  return (
    <div>
      <h1>DocuMind AI</h1>
      <p>Intelligent Document Q&A with RAG</p>

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}

export default App;