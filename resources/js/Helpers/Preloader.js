import React from "react";
import { connect } from "react-redux";

const Preloader = ({ Preloader }) => {
    if (Preloader.showPreloader) {
        return (
            <LoaderPreloader></LoaderPreloader>
        )
    }
    return '';
}


export const LoaderPreloader = () => {
    return (
        <div id="preloader" className="LoaderPreloader">
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


const mapStateToProps = ({ Preloader }) => {
    return {
        Preloader
    }
}

export default connect(mapStateToProps)(Preloader);