import React, { Fragment,useState,useEffect } from "react";
import { connect } from "react-redux";

import { fetchRequest } from "../../Redux/Actions/fetchRequest";
import { pathApi } from "../../env";

import AlertMessageSingular from "../../Helpers/AlertMessageSingular";


const ListGroups=({
    Auth,
    fetchRequest
})=>{
    const { token } = Auth;
    const [responseMessage, setResponseMessage] = useState({})

    const [listGroups,setListGroups]=useState([]);

    const handleListGroup = async () => {
        
        let request = {
            'url': `${pathApi}/listSchoolGroup`,
            'request': {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },
            "showLoader": true
        };
        let response = await fetchRequest(request);
        if(response.status!=200){
            setResponseMessage(response);
            return;
        }
        setListGroups(response.data);
    }

    useEffect(()=>{
        handleListGroup();
    },[])

    return(
        <Fragment>
           <AlertMessageSingular {...responseMessage}></AlertMessageSingular>

            {listGroups.map((item)=>(
                <Fragment>
                     <ul>
                        <li>${item.name}</li>
                        <li>${item.semester} º Semestre</li>
                        <li>${item.shift}</li>
                        <li>${item.year_period}</li>
                        <li>${item.period}</li>
                     </ul>
                </Fragment>
            ))}

        </Fragment>
    )
}

const mapStateToProps = ({ Auth }) => {
    return {
        Auth
    }
}

const mapDispatchToProps = {
    fetchRequest
}

export default connect(mapStateToProps,mapDispatchToProps)(ListGroups);