import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { renderAsync } from 'docx-preview';
import axios from 'axios';
import AdrDocumentBody, { getBlankAdrReport } from './AdrDocumentBody';
import HeaderDocument from './HeaderDocument';
import FooterDocument from './FooterDocument';

function isAdrTemplate(name, filename) {
    const base = (name || (filename || '').replace(/\.docx$/i, '')).replace(/\s+/g, '_').trim();
    return /^ADR_template$/i.test(base);
}

function TemplateViewModal({ isOpen, templateFilename, templateName, onClose }) {
    const bodyRef = useRef(null);
    const styleRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const useAdrLayout = isOpen && templateFilename && isAdrTemplate(templateName, templateFilename);

    useEffect(() => {
        if (!isOpen || useAdrLayout) {
            setError(null);
            if (bodyRef.current) bodyRef.current.innerHTML = '';
            if (styleRef.current) styleRef.current.innerHTML = '';
            return;
        }

        if (!templateFilename) return;

        setLoading(true);
        setError(null);
        if (bodyRef.current) bodyRef.current.innerHTML = '';
        if (styleRef.current) styleRef.current.innerHTML = '';

        const controller = new AbortController();
        axios.get(`/api/templates/${encodeURIComponent(templateFilename)}/preview`, {
            responseType: 'blob',
            signal: controller.signal,
        })
            .then((res) => {
                const blob = res.data;
                if (!blob || blob.size === 0) {
                    setError('Template is empty.');
                    setLoading(false);
                    return;
                }
                const bodyEl = bodyRef.current;
                const styleEl = styleRef.current;
                if (!bodyEl || !styleEl) {
                    setLoading(false);
                    return;
                }
                renderAsync(blob, bodyEl, styleEl, { className: 'docx' })
                    .then(() => setLoading(false))
                    .catch((err) => {
                        setError(err?.message || 'Failed to render template.');
                        setLoading(false);
                    });
            })
            .catch((err) => {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                setError(err?.response?.data?.message || 'Failed to load template.');
                setLoading(false);
            });

        return () => controller.abort();
    }, [isOpen, templateFilename, useAdrLayout]);

    useEffect(() => {
        if (!isOpen) return;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        const root = document.documentElement;
        const body = document.body;
        root.classList.add('document-modal-open');
        body.classList.add('document-modal-open');
        body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';
        return () => {
            root.classList.remove('document-modal-open');
            body.classList.remove('document-modal-open');
            body.style.paddingRight = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="document-modal">
            <div className="document-modal__overlay" onClick={onClose} aria-hidden="true" />
            <div className="document-modal__container" onClick={(e) => e.stopPropagation()}>
                <div className="document-modal__header">
                    <h2>{templateName ? `Template: ${templateName}` : 'Template Preview'}</h2>
                    <div className="document-modal__actions">
                        <button type="button" onClick={onClose} className="document-modal__close-btn" aria-label="Close">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="document-modal__content">
                    {useAdrLayout ? (
                        <div className="document-modal__template-body document-modal__template-body--adr">
                            <div className="document-viewer__document">
                                <div className="document-viewer__page document-viewer__page--sheet document-viewer__page--template-preview" style={{ width: '210mm', minWidth: '210mm', maxWidth: '100%', margin: '0 auto', boxSizing: 'border-box', paddingLeft: '1rem' }}>
                                    <HeaderDocument compact />
                                    <AdrDocumentBody report={getBlankAdrReport()} blankPlaceholders />
                                    <FooterDocument />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="document-modal__template-body docx-preview-modal">
                            {loading && (
                                <div className="document-modal__pdf-loading" aria-live="polite">
                                    Loading template…
                                </div>
                            )}
                            {error && !loading && (
                                <div className="document-modal__pdf-error">
                                    <p>{error}</p>
                                </div>
                            )}
                            <div ref={styleRef} style={{ display: 'none' }} />
                            <div ref={bodyRef} style={{ display: loading ? 'none' : 'block', minHeight: '60vh' }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

export default TemplateViewModal;
