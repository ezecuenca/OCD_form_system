import React from "react";
import { NavLink } from "react-router-dom";

function SwapForm() {
    return (
        <div className="swapform">
            <div className="swapform__header">
                <h1 className="swapform__title">Swap Form</h1>
            </div>
            <div className="swapform__content">
                <p>Swap form content will go here.</p>
            </div>
            <div className="swapform__navigation">
                <NavLink to="/settings" className="swapform__navlink">
                    Go to Settings
                </NavLink>
            </div>
        </div>
    );
}

export default SwapForm;