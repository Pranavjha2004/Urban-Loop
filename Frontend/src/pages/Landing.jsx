import React from "react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="bg-amber-100">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>

      <br />

      <Link to="/register">
        <button>Register</button>
      </Link>

      <br /><br />

      <Link to="/login">
        <button>Login</button>
      </Link>
    </div>
  );
};

export default Landing;