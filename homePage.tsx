import React from "react";
import "./index.css";

const HomePage = () => {
  console.log('hey');
  return (
    <div className="homepage">
     <h1 > AMMO INVENTORY</h1>
     <div className="img-list">
      <div className="img-list">
        <img className="img" src="https://www.idf.il/media/nnfdvmf4/587ba832-a5ac-46e6-993d-25fcc957d370.jpeg" alt="" />
        <img className="img" src="https://www.idf.il/media/4nvfmlkm/c694ad0a-6d88-41cd-af1a-bb48e658734b.jpeg" alt="" />
        <img className="img" src="https://www.jdn.co.il/wp-content/uploads/2024/06/whatsapp-image-2024-06-04-at-09-02-18.webp" alt="" />
      </div>
     </div>
     <div className="question">
      <details>
        <summary>who need this app ? </summary>
        <p>The application is suitable for anyone who is responsible for all ammunition in the battalion</p>
      </details>
      <details>
        <summary>What are the benefits of using the app ?</summary>
        <p>The application helps to manage the ammunition management in the battalion and provides information about the lack of ammunition to the people responsible for the ammunition in the battalion</p>
      </details>
      <details>
        <summary>How register to this app ? </summary>
        <p>To register for the site click on the register button enter your details click on the register me button and you are registered in our system</p>
      </details>
      <details>
        <summary>Want to know more about us ? </summary>
        <p>The 215th Fire Brigade is a regular brigade in the Artillery Corps. The brigade belongs to the Steel Formation (Division 162) a regular multi-area division.
           The 215th Brigade is a multi-system and multi-armed brigade, and includes battalions of "Dohar" (M-109) model rocket launchers, including two regular battalions ("Reshef" and "Drakon") and reserve battalions ("Ealy", which was also a regular battalion until the first decade of the 21st century, and "Lahav"). The brigade includes a reserve rocket battalion, Battalion 8194.
           In the past, the brigade included a precision fire unit (the "Morag" Battalion), and previously also a target intelligence and fire control unit (the ATR unit).
           In September 2019, the Sky Rider Unit (5353) joined the brigade. In December, the first brigade exercise was held, thus completing the process of transforming the brigade into a brigade called the "215th Fire Brigade".
           The brigade is responsible for the processes of multi-scene fire operations on the battlefield, from the company level to the division level.
        </p>
      </details>
     </div>
    </div>
  );
};

export default HomePage;
