import React from "react";
import "./Info.scss"

const Info = () =>{
    return (
        <div className="container-fluid  info">
            <div className="container p-5 text-center  rounded-3 border border-secondary info-card">

                <h1 className="fw-bold text-danger">
                    Special Thanks:
                </h1>

                {/* Top line */}
                <div className="d-flex justify-content-center gap-5 lead text-light mt-4">
                    <div className="st1">
                        <strong className="text-light">
                            Prof. Mr. S. D. Chavan Sir
                        </strong>
                        <div className="text-secondary">
                            Project Guide
                        </div>
                    </div>

                    <div/><div/><div/><div/><div/><div/><div/><div/><div/>

                    <div className="st2">
                        <strong className="text-light">
                            S2P - Nagpur
                        </strong>
                        <div className="text-secondary">
                            for guidance
                        </div>
                    </div>
                </div>
                <hr />

                {/* Second line */}
                <div>
                    <h4 className="fw-bold text-developer">
                        Developers:
                    </h4>
                    <div className=" justify-content-center gap-5 lead text-light mt-4">
                        <strong className="text-light">
                                Mr. Harsh A. Dudhe
                        </strong>
                        <div className="text-secondary">
                                4RA43
                        </div>
                        <div className="text-secondary">
                                Project Leader
                        </div>
                    </div>

                    <div className="d-flex justify-content-center gap-5 lead text-light mt-4">
                        <div>
                            <strong className="text-light">
                                Mr. Parth A. Ingole
                            </strong>
                            <div className="text-secondary">
                                    4RA56
                            </div>
                        </div>
                        <div>
                            <strong className="text-light">
                                    Ms. Vedika V. Ade
                            </strong>
                            <div className="text-secondary">
                                    4RA29
                            </div>
                        </div>
                        <div>
                            <strong className="text-light">
                                    Ms. Saloni J. Kuldipkar
                            </strong>
                            <div className="text-secondary">
                                    4RA21
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Info