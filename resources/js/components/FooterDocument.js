import React from 'react';

function FooterDocument(props, ref) {
    return (
        <footer ref={ref} className="footer-document" {...props}>
            <div className="footer-document__line"></div>
            <p className="footer-document__slogan">SERVING THE NATION, PROTECTING THE PEOPLE</p>
            <div className="footer-document__info">
                <p>Office of Civil Defense Caraga Regional Office</p>
                <p>Email Address: <span className="footer-document__email">civildefensecaraga@gmail.com</span></p>
                <p>Hotline: (085) 817-1209 / 0947-946-8145</p>
                <p>Facebook Page: Civil Defense Caraga</p>
            </div>
        </footer>
    );
}

export default React.forwardRef(FooterDocument);
