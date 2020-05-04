import React from "react";

export default function({ "data-source": { udn, type, maker, model, modelNumber } }) {
    return <div className="form-table">
               <div>
                   <div>UDN</div>
                   <div>{udn}</div>
               </div>
               <div>
                   <div>Type</div>
                   <div>{type}</div>
               </div>
               <div>
                   <div>Maker</div>
                   <div>{maker}</div>
               </div>
               <div>
                   <div>Model</div>
                   <div>{model}</div>
               </div>
               <div>
                   <div>Model #</div>
                   <div>{modelNumber}</div>
               </div>
           </div>;
}