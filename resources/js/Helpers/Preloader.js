import React from "react";
import { connect } from "react-redux";

const Preloader = ({ Preloader }) => {
    if (Preloader.showPreloader) {
        return (
            <div id="preloader">
                <div id="status">
                    <div className="spinner-chase">
                        <div className="chase-dot"></div>
                        <div className="chase-dot"></div>
                        <div className="chase-dot"></div>
                        <div className="chase-dot"></div>
                        <div className="chase-dot"></div>
                        <div className="chase-dot"></div>
                    </div>
                </div>
            </div>
        )
    }
    return '';
}


const mapStateToProps = ({ Preloader }) => {
    return {
        Preloader
    }
}

export default connect(mapStateToProps)(Preloader);