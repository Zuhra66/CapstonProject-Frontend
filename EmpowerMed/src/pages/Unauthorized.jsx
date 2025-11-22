// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="page-content">
      <div className="container text-center py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <h1 className="display-4 text-danger">Access Denied</h1>
            <p className="lead">You are not authorized to access this page.</p>
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">EmpowerMEd LLC Disclaimer</h5>
                <p className="card-text">
                  This administrative section is restricted to authorized personnel only. 
                  Unauthorized access attempts may be subject to legal action under 
                  EmpowerMEd LLC policies and applicable laws.
                </p>
                <Link to="/" className="btn btn-primary">Return to Home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}