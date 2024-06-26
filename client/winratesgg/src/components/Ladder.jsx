import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';
import LadderError from '../errors/LadderError';

const Ladder = ({globallyUpdateDisplayedRegion}) => {
    const params = useParams()
    const location = useLocation()

    const [rankedLadder, setRankedLadder] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    // const [displayRegion, setDisplayRegion] = useState(params.displayRegion)



    // UPDATE THIS SO IT WORKS FOR TIERS !!!!!!!!!!!!!!!!!! 
    const navigate = useNavigate()

    useEffect(() => {
        getLeaderboard();
    // }, [displayRegion, location.pathname]);
    }, [location.pathname]);


async function getLeaderboard() {        

        // Config to abort get request on timeout (45s), without this even if I redirect via the loading component the GET request will still process in this component & re-render
        const controller = new AbortController()
        const signal = controller.signal;
        const timeout = setTimeout(() => {
            controller.abort()
        }, 120000)

        try {
            const displayedRegion = params.displayRegion
            const mapDisplayedToRegionToVerboseRegion = {
                'na': 'americas',
                'br': 'americas',
                'lan': 'americas',
                'las': 'americas',
                'euw': 'europe',
                'eun': 'europe',
                'tr': 'europe',
                'ru': 'europe',
                'kr': 'asia',
                'jp': 'asia',
                'oc': 'sea',
                'ph': 'sea',
                'sg': 'sea',
                'th': 'sea',
                'tw': 'sea',
                'vn': 'sea',
            }
            let newRegion = mapDisplayedToRegionToVerboseRegion[displayedRegion]

            const mapDisplayedRegionToPlatform = {
                'na': 'na1',
                'br': 'br1',
                'lan': 'la1',
                'las': 'la2',
                'euw': 'euw1',
                'eun': 'eun1',
                'tr': 'tr1',
                'ru': 'ru',
                'kr': 'kr',
                'jp': 'jp1',
                'oc': 'oc1',
                'ph': 'ph2',
                'sg': 'sg2',
                'th': 'th2',
                'tw': 'tw2',
                'vn': 'vn2',
            }
            const newPlatform = mapDisplayedRegionToPlatform[displayedRegion]
            // let response = await axios.get(`http://127.0.0.1:8000/api/ladder/?&platform=${newPlatform}&region=${newRegion}&page=${params.pageNumber}`);  // dev (npm start command)

            // let url = `http://127.0.0.1:8000/api/ladder/?&platform=${newPlatform}&region=${newRegion}&page=${params.pageNumber}` // npm start (dev)
            let url = `http://127.0.0.1/api/ladder/?&platform=${newPlatform}&region=${newRegion}&page=${params.pageNumber}`;  // prod port :8000 is factored out, NGINX will route from default port 80 to appropriate server
            let response = await axios.get(url, {signal})
            clearTimeout(timeout)
            console.log(response.data);
            // localStorage.setItem('platform', newPlatform);
            // localStorage.setItem('region', newRegion);
            // localStorage.setItem('displayRegion', displayedRegion) 
            setRankedLadder(response.data)
            globallyUpdateDisplayedRegion(newPlatform)
            setLoading(false)
            setError(false)
        } catch (error) {
            clearTimeout(timeout)
            setLoading(false)
            if (axios.isCancel(error)){
                console.log(error)
                setError({"message": "Request took excessively long. Please try again momentarily", status_code: 408})
            } else if (error.response) {
                console.log(error.response.data);
                setError({"message": error.response.data, status_code: error.response.status})
            } else {
                console.log(error.message);
                setError({ "message": "Unexpected error occurred. Please try again later.", status_code: error.code || "UNKNOWN" });
            }
        }
    }

    function updateSelection(platformChoice){

        // const selectedPlatform = platformChoice
        // const mapPlatormToRegion = {
        //     'na1': 'americas',
        //     'br1': 'americas',
        //     'euw1': 'europe',
        //     'kr': 'asia'     
        // }
        // const mapDisplayedToRegionToVerboseRegion = {
        //     'na': 'americas',
        //     'br': 'americas',
        //     'euw': 'europe',
        //     'kr': 'asia'     
        // }
        // let newRegion = mapDisplayedToRegionToVerboseRegion[params.displayRegion]


        // const newDisplayRegion = selectedPlatform.replace(/[0-9]+$/, '') // Remove trailing numbers from Platform
        // localStorage.setItem('platform', platformChoice);
        // localStorage.setItem('region', newRegion);
        // localStorage.setItem('displayRegion', newDisplayRegion)
        // globallyUpdateDisplayedRegion(platformChoice)
        setLoading(true)
        navigate(`/ladder/${platformChoice.replace(/[0-9]+$/, '')}/1`)
        }


    function setPrevPage(){
        setLoading(true)
        navigate(`/ladder/${params.displayRegion}/${parseInt(params.pageNumber)-1}`)

    }

    function setNextPage(){
        setLoading(true)
        navigate(`/ladder/${params.displayRegion}/${parseInt(params.pageNumber)+1}`)
    }

    if (loading){
        return <Loading/>
    }

    if (error) {
        return <LadderError error={error}/>
    }

    return (
        <>
            <button onClick={() => updateSelection('na1')} style={{ backgroundColor: params.displayRegion === 'na' ? 'lightblue' : 'white' }}>North America</button>
            <button onClick={() => updateSelection('br1')} style={{ backgroundColor: params.displayRegion === 'br' ? 'lightblue' : 'white' }}>Brazil</button>
            <button onClick={() => updateSelection('euw1')} style={{ backgroundColor: params.displayRegion === 'euw' ? 'lightblue' : 'white' }}>Europe West</button>

            {rankedLadder?.map((player, index) => { 
                let wins = player?.metadata?.wins;
                let losses = player?.metadata?.losses;
                let winrate = Math.round((wins / (wins + losses)) * 100);
                return (
                    <div key={index}>
                        <span>
                            {(index + 1) + (params.pageNumber * 10 - 10) + '.'} <Link to={`/summoners/${params.displayRegion}/${player?.gameName}-${player?.tagLine}`}>{player?.gameName + ' #' + player?.tagLine}</Link> {player?.metadata?.tier} {player?.metadata?.leaguePoints} LP {wins}W {losses}L {winrate}%
                        </span>
                    </div>
                );
            })}

            {/* If page is 1 do not show the prev button, and only show X (say 3) numbers of pages */}
            { parseInt(params.pageNumber) !== 1 ? 
                <button onClick={() => setPrevPage()}>Prev Page </button> :
                null
            }
            { parseInt(params.pageNumber) !== 3 ?
                <button onClick={() => setNextPage()}>Next Page </button> :
                null
            }
        </>
    )
};

export default Ladder;