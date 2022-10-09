import React, { Fragment } from "react";


const TitleModule = () => {
    return (
        <Fragment>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box d-flex align-items-center justify-content-between">
                        <h4 className="page-title mb-0 font-size-18" id="title_module">{'Module'}</h4>
                        <div className="page-title-right">
                            <ol className="breadcrumb m-0">
                                {/*
                                <li className="breadcrumb-item active">Welcome to Qovex Dashboard</li>
                                */}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default TitleModule;