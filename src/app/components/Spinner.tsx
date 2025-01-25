import React from 'react'

export default function Spinner({color}: {color: string}) {
  {color == "remaster" && (
    <div className="remaster-spinner w-8 h-8"></div>
  )}
  {color == "white" && (
    <div className="white-spinner w-8 h-8"></div>
  )}
}
