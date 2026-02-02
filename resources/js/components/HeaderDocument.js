import React from 'react';

// Header dimensions controlled here so document-viewer content styles cannot override them
const LOGO_SIZE = 120;        // px – default (e.g. when not in a sheet)
const LOGO_SIZE_COMPACT = 98; // px – when used inside document-viewer sheet (per-page header)

function HeaderDocument({ compact = false, ...props }, ref) {
    const logoPx = compact ? LOGO_SIZE_COMPACT : LOGO_SIZE;
    const logoStyle = { width: logoPx, height: logoPx, minWidth: logoPx, minHeight: logoPx };

    return (
        <header ref={ref} className="header-document" {...props}>
            <div className="header-document__content">
                <div className="header-document__logos">
                    <div className="header-document__logo-left" style={logoStyle}>
                        <img
                            src={`${window.location.origin}/images/ocd_logo.svg`}
                            alt="Office of Civil Defense"
                            className="header-document__logo-img"
                        />
                    </div>
                    <div className="header-document__text">
                        <p className="header-document__republic">REPUBLIC OF THE PHILIPPINES</p>
                        <p className="header-document__department">DEPARTMENT OF NATIONAL DEFENSE</p>
                        <p className="header-document__office">OFFICE OF CIVIL DEFENSE</p>
                        <p className="header-document__region">Caraga Region</p>
                        <div className="header-document__line"></div>
                        <p className="header-document__address">CAMP ROMUALDO C RUBI, BANCASI, BUTUAN CITY 8600, PHILIPPINES</p>
                    </div>
                    <div className="header-document__logo-right" style={logoStyle}>
                        <img
                            src={`${window.location.origin}/images/bagong_phil_logo.svg`}
                            alt="Bagong Pilipinas"
                            className="header-document__logo-img"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}

export default React.forwardRef(HeaderDocument);
