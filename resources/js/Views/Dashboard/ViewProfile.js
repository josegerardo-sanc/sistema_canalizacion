import React, { useEffect } from "react";
import { connect } from "react-redux";
/**components */
import { CardProfile, FormProfile, FormProfileStudent } from "../../Components/User/Profile";

/**helpers */
import AlertMessage from "../../Helpers/AlertMessage";

const ViewProfile = ({
    Auth
}) => {
    useEffect(() => {
        document.getElementById('title_module').innerText = "Perfil";
    }, [])
    return (
        <div className="row">
            <div className="col-12">
                <AlertMessage></AlertMessage>
                {
                    !(Auth.user.complete_register)?(
                        <div class="mt-2 alert alert-warning alert-dismissible fade show" role="alert">
                            <strong>Ayúdanos a completar tu Información.</strong>
                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    ):""
                }
            </div>
            <div className="col-md-12 col-xl-3">
                <CardProfile></CardProfile>
            </div>
            <div className="col-md-12 col-xl-9">
                <FormProfile></FormProfile>
                <FormProfileStudent></FormProfileStudent>
            </div>
        </div>
    )
}
const mapStateToProps = ({ Auth }) => {
    return {
        Auth
    }
}

export default connect(mapStateToProps, null)(ViewProfile);