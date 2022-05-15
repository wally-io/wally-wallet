import React, {useEffect, useState} from "react"
import {fetchToken, onMessageListener} from "../firebase/firebase-client"
import {Button, Col, FormControl, Row, Toast} from "react-bootstrap"
import Http from "../utils/Http"
import {useNavigate} from "react-router-dom"
import {ethers, Wallet} from "ethers"
import ERC20 from "erc-20-abi"

export const domain = process.env.REACT_APP_WALLY_API

const USDC_ADDRESS = "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"

function Home() {

    let navigate = useNavigate()
    /** popup */
    const [show, setShow] = useState(false)
    const [notification, setNotification] = useState({title: '', body: ''})
    /** state */
    const [dappLink, setDAppLink] = useState("")
    const [usdcBalance, setUsdcBalance] = useState("")
    const [isFcmOn, setFcmOn] = useState(localStorage.getItem("fcm") != null)

    useEffect(() => {
        if (localStorage.getItem("wallet-private") == null) {
            navigate("")
        }
        const privateKey = localStorage.getItem("wallet-private")!
        const address = localStorage.getItem("wallet-address")!
        Http.post(domain!, "/wallet/eth/challenge", null, {address: address}, async (response: any) => {
            const message = response.message
            let provider = ethers.getDefaultProvider('goerli')
            const wallet = new ethers.Wallet(privateKey, provider)
            const signature = await wallet.signMessage(message)
            console.log("address: ", address)
            console.log("signature: ", signature)

            Http.post(domain!, "/wallet/login", null, {address, signature}, (response: any) => {
                getUSDCBalance(provider)
                localStorage.setItem("token", response.token)
            }, (error) => {
                Http.post(domain!, "/wallet/eth/register", null, {address, signature}, (response: any) => {
                    getUSDCBalance(provider)
                    localStorage.setItem("token", response.token)
                }, (error) => {
                    console.error(error)
                })
            })
        }, (error) => {
            console.error(error)
        })
    }, [])

    onMessageListener().then((payload: any) => {
        setNotification({title: payload.notification.title, body: payload.notification.body})
        setShow(true)
        console.log("RECEIVE NOTIFICATION:", payload)
    }).catch(err => console.log('failed: ', err))

    const onShowNotificationClicked = () => {
        setNotification({title: "Notification", body: "This is a test notification"})
        setShow(true)
    }

    const onConnectFCMClicked = () => {
        fetchToken(setFcmOn)
    }

    const onDAppLinkClicked = () => {
        const walletToken = localStorage.getItem("token")!
        Http.post(domain!, dappLink, walletToken, {authorizations: []}, (response: any) => {
            console.log("DApp connected")
        }, (error) => {
            console.error(error)
        })
    }

    const getUSDCBalance = async (provider: any) => {
        const address = localStorage.getItem("wallet-address")
        if (address == null) {
            return "0"
        }
        const contract = new ethers.Contract(USDC_ADDRESS, ERC20, provider);
        const balance = await contract.balanceOf(address)
        setUsdcBalance(balance.toString())
    }

    const onPublishTransactionClicked = () => {
        let provider = ethers.getDefaultProvider('goerli')
        const privateKey = localStorage.getItem("wallet-private")!
        const wallet = new ethers.Wallet(privateKey, provider)
        const walletToken = localStorage.getItem("token")!
        Http.get(domain!, "/transactions/find", walletToken, {status: "CREATED"}, async (response: any) => {
            for (const tx of response.transactions) {
                const raw = JSON.parse(tx.transaction)
                let response = await wallet.sendTransaction(raw);
                Http.post(domain!, "/transactions/publish/set-start", walletToken, {transactionId: tx.id}, (response: any) => {}, (error) => {console.error(error)})
                try {
                    await response.wait();
                    console.log("response:", response)
                    Http.post(domain!, "/transactions/publish/set-success", walletToken, {transactionId: tx.id, response: JSON.stringify(response)}, (response: any) => {}, (error) => {console.error(error)})
                } catch (e) {
                    Http.post(domain!, "/transactions/publish/set-fail", walletToken, {transactionId: tx.id, error: JSON.stringify(e)}, (response: any) => {}, (error) => {console.error(error)})
                }
            }
        }, (error) => {
            console.error(error)
        })
    }

    return (
        <div className="App">
            <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide animation style={{
                position: 'absolute',
                top: 20,
                right: 20,
                minWidth: 200
            }}>
                <Toast.Header>
                    <img
                        src="holder.js/20x20?text=%20"
                        className="rounded mr-2"
                        alt=""
                    />
                    <strong className="mr-auto">{notification.title}</strong>
                    <small>just now</small>
                </Toast.Header>
                <Toast.Body>{notification.body}</Toast.Body>
            </Toast>
            <header className="App-header">
                {isFcmOn && <h2> Notification permission enabled </h2>}
                {!isFcmOn && <h2> Need notification permission ❗️ </h2>}
                <h3>--</h3>
                <h3> Wallet: {localStorage.getItem("wallet-address")} </h3>
                <h3> USDC: {usdcBalance} </h3>
                {!isFcmOn && <Row><Col><Button onClick={() => onConnectFCMClicked()}>Connect FCM</Button></Col></Row>}
            </header>
            <Row><Col><Button onClick={() => onShowNotificationClicked()}>test Toast</Button></Col></Row>
            <Row>
                <Col><FormControl value={dappLink} onChange={(event) => setDAppLink(event.target.value)}/></Col>
                <Col><Button onClick={() => onDAppLinkClicked()}>connect with DApp</Button></Col>
            </Row>
            <Row>
                <Col><Button onClick={() => onPublishTransactionClicked()}>publish pending transactions</Button></Col>
            </Row>
        </div>
    )
}

export default Home