const express = require("express");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const objectSnakeCaseToCamelCase = (newObject) => {
  return {
    stateId: newObject.state_id,
    stateName: newObject.state_name,
    population: newObject.population,
  };
};

const districtSnakeToCamel = (newObject) => {
  return {
    districtId: newObject.district_id,
    districtName: newObject.district_name,
    stateId: newObject.state_id,
    case: newObject.case,
    cured: newObject.cured,
    active: newObject.active,
    deaths: newObject.deaths,
  };
};
const reportSnakeToCamelCase = (newObject) => {
  return {
    totalCases: newObject.cases,
    totalCured: newObject.cured,
    totalActive: newObject.active,
    totalDeaths: newObject.deaths,
  };
};

const initializeDBAndServer = () => {
  try {
    open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

app.get("/states/", async (request, response) => {
  const statesQuery = `
    SELECT 
      * 
    FROM state;`;
  const statesList = await db.all(statesQuery);
  const stateResults = statesList.map((eachObject) => {
    return objectSnakeCaseToCamelCase(eachObject);
  });
  response.send(stateResults);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `
  SELECT 
    * 
  FROM state
  WHERE 
    stateId : ${state_id};`;
  const newState = await db.get(getState);
  const result = objectSnakeCaseToCamelCase(newState);
  response.send(result);
});

app.post("/districts/", async (request, response) => {
  const createDistrict = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = createDistrict;
  const newDistrict = `
  INSERT INTO 
    district(district_name,state_id,cases,cured,active,deaths)
  VALUES
    (${districtName}, ${stateId}, ${cases}, ${cured} , ${active},${deaths});`;
  const addDistrict = await db.run(createDistrict);
  const districtId = addDistrict.lastID;
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `
  SELECT 
    * 
  FROM district 
  WHERE 
  district_id:${districtId};`;
  const districtDetails = await db.get(getDistrict);
  const districtResult = districtSnakeToCamel(districtDetails);
  response.send(districtResult);
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistricts = `
    DELETE FROM 
    district 
    WHERE 
      delete_id ${deleteId};`;
  await db.run(deleteDistricts);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const updateName = `
  UPDATE 
    district 
  SET 
    district_name =${districtName},
    state_id =${stateId},
    cases=${cases},
    cured=${cured},
    active=${active},
    deaths=${deaths}
  WHERE 
    district_id = ${districtId};`;
  await db.run(updateName);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateReport = `
    SELECT 
    SUM(cases) AS cases,
    SUM(cured) AS cured,
    SUM(active)AS active,
    SUM(deaths) AS deaths,
    WHERE 
    state_id :${stateId};`;
  const stateReport = await db.all(getStateReport);
  const resultReport = reportSnakeToCamelCase(stateReport);
  response.send(resultReport);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const stateDetails = `
    SELECT 
      state_name 
    FROM state JOIN district
      ON state.state_id = district.state_id
    WHERE district.district_id : ${districtId};`;
  const details = await db.all(stateDetails);
  response.send({ details: stateName.state_name });
});

module.exports = app;
