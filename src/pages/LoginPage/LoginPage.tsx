import { Navigate, useNavigate } from "react-router-dom"; import { AuthForm } from "../../components/AuthForm/AuthForm"; import { useAuth } from "../../context/AuthContext";
export function LoginPage(){const {user}=useAuth();const navigate=useNavigate();if(user)return <Navigate to="/profile" replace/>;return <div className="authPage"><AuthForm onSuccess={()=>navigate("/profile")}/></div>}
