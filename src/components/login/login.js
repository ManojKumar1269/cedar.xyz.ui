import { useEffect, useState } from "react";
import { API_URL } from "./../../constant";
import { isExpired } from "./../../constant";

function Login({ routeChange }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const user = JSON.parse(window.localStorage.getItem("user"));
    if (user && user.access_token && user._id && user.access_token_expires && !isExpired(user.access_token_expires)) {
      routeChange("home");
    } else {
      window.localStorage.removeItem("user");
    }
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    if (!(email && password)) return;
    if (isRegister && !fullName) return;

    let param = {
      email: email,
      password: password,
    };

    if (isRegister) {
      param.full_name = fullName;
    }

    fetch(isRegister ? `${API_URL}/users/register` : `${API_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(param),
    })
      .then((response) => response.json())
      .then((data) => {
        if (isRegister) {
          if (data && data === 'Email already exists.') {
            alert("Email already exists.");
          } else {
            setIsRegister(false);
            reset();
            alert("Registered successfully. Please login to continue.");
          }
        } else {
          if (data && data.access_token && data._id) {
            reset();
            window.localStorage.setItem("user", JSON.stringify(data));
            routeChange("home");
          }else {
            alert("Invalid email or password");
          }
        }
      });
  };

  const reset = () => {
    setEmail("");
    setPassword("");
    setFullName("");
  }

  const handleEmail = (event) => {
    const value = event.target.value;
    setEmail(value);
  };

  const handlePassword = (event) => {
    const value = event.target.value;
    setPassword(value);
  };

  const handleFullName = (event) => {
    const value = event.target.value;
    setFullName(value);
  };

  const handleAlreadyHaveAccount = () => {
    setIsRegister(!isRegister);
    reset();
  }

  return (
    <div>
      <h1 className="text-center">XYZ</h1>
      <h4 className="text-center mb-3 border-bottom p-3">Customer Portal</h4>
      {isRegister ? (
        <h5 className="mb-4">Register</h5>
      ) : (
        <h5 className="mb-4">Login</h5>
      )}
      <form onSubmit={handleLogin}>
        {isRegister ? (
          <div className="mb-3">
            <label htmlFor="FullName" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="FullName"
              value={fullName}
              onChange={handleFullName}
            />
          </div>
        ) : null}
        <div className="mb-3">
          <label htmlFor="InputEmail" className="form-label">
            username
          </label>
          <input
            type="text"
            className="form-control"
            id="InputEmail"
            value={email}
            onChange={handleEmail}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="InputPassword" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="InputPassword"
            value={password}
            onChange={handlePassword}
          />
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary">
            {isRegister ? "Register" : "Login"}
          </button>
        </div>

        <div className="mt-3 p-3 bg-light text-center">
          <p>Already have an account?</p>
          <button className="btn btn-small btn-success" onClick={handleAlreadyHaveAccount}>{isRegister ? "Login Here" : "Register Here"}</button>
        </div>
      </form>
    </div>
  );
}

export default Login;
