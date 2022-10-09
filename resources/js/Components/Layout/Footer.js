import React from "react";

import { footerInfo } from '../../env'
/*configurations*/
const Footer = () => {
    return (
        <footer className="footer">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-6">

                    </div>
                    <div className="col-sm-6">
                        <div className="text-sm-right d-none d-sm-block">
                            {new Date().getFullYear()} © {footerInfo}.
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
export default Footer;