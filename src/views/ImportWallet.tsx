import {ethers} from "ethers"
import React, {useState} from "react"
import {Button, Col, FormControl, Row} from "react-bootstrap"
import {useNavigate} from "react-router-dom"

function ImportWallet() {
    let navigate = useNavigate()
    const [mnemonic, setMnemonic] = useState("")

    const onImportWalletClicked = () => {
        const wallet = ethers.Wallet.fromMnemonic(mnemonic)
        console.log('address:', wallet.address)
        console.log('mnemonic:', wallet.mnemonic.phrase)
        console.log('privateKey:', wallet.privateKey)
        localStorage.setItem("wallet-private", wallet.privateKey)
        localStorage.setItem("wallet-address", wallet.address)
        localStorage.setItem("wallet-mnemonic", wallet.mnemonic.phrase)
    }
    const onNextClicked = () => {
        navigate("/home")
    }
    return (
        <div>
            <Row>
                <Col><FormControl value={mnemonic} onChange={(event) => setMnemonic(event.target.value)}/></Col>
                <Col><Button onClick={() => onImportWalletClicked()}>Import Wallet</Button></Col>
            </Row>
            <Row><Col><Button onClick={() => onNextClicked()}>Next</Button></Col></Row>
        </div>
    )
}

export default ImportWallet