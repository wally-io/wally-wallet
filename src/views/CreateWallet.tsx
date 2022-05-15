import {Button, Col, Row} from "react-bootstrap"
import React, {useEffect} from "react"
import {ethers} from "ethers"
import {useNavigate} from "react-router-dom"

function CreateWallet() {
    let navigate = useNavigate()

    useEffect(() => {
        const wallet = ethers.Wallet.createRandom()
        console.log('address:', wallet.address)
        console.log('mnemonic:', wallet.mnemonic.phrase)
        console.log('privateKey:', wallet.privateKey)
        localStorage.setItem("wallet-private", wallet.privateKey)
        localStorage.setItem("wallet-address", wallet.address)
        localStorage.setItem("wallet-mnemonic", wallet.mnemonic.phrase)
    }, [])

    const onNextClicked = () => {
        navigate("/home")
    }

    return (
        <div>
            <Row><Col><Button onClick={() => onNextClicked()}>Next</Button></Col></Row>
        </div>
    )
}

export default CreateWallet