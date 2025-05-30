import React from "react";
import "../styles/ProgressBar.css";

function ProgressBar({ completed, total }) {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="progress-bar-container">
            <div className="progress-bar-label">
                Progres zilnic: {completed}/{total} obiceiuri ({percentage}%)
            </div>
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

export default ProgressBar;
