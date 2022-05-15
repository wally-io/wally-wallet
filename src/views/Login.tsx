import {Button} from "react-bootstrap"
import {useNavigate} from "react-router-dom"

function Login() {
    let navigate = useNavigate();

    const goToCreateWallet = () => {
        navigate("/login/create-wallet")
    }

    const goToImportWallet = () => {
        navigate("/login/create-wallet")
    }

    return (
        <div>
            <Button onClick={goToCreateWallet}>Create Wallet</Button>
            <Button onClick={goToImportWallet}>Import Wallet</Button>
        </div>
    )
}
export default Login