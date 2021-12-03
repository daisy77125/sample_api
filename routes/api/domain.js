const express = require("express");
const router = express.Router();
const uuid = require("uuid");
const FuzzySearch = require("fuzzy-search");

const domains = require("../../Domains.json"); // use json file to emulate db
const searcher = new FuzzySearch(domains, ["domainName", "domainOwner"], {
  caseSensitive: false,
});

// Create Domain
router.post("/", (req, res) => {
  const newDomain = {
    ...req.body,
    domainId: uuid.v4(),
  };

  // check whether info is complete
  if (!newDomain.domainName || !newDomain.domainOwner || !newDomain.ownerId) {
    return res.status(400).json({ msg: "Information incomplete" });
  }

  // check whether the domain name already existed in db
  const existingDomainNameFound = domains.some(
    (domain) => domain.domainName === newDomain.domainName
  );
  if (existingDomainNameFound) {
    return res.status(400).json({ msg: "Domain Name has been taken." });
  }

  domains.push(newDomain);
  res.json({
    msg: "New domain created successfully",
    newDomain,
  });
});

// GET /domain/
// Fetch list of domains with the support of pagination
// use query string to indicate pagination
// for example: /?page=1&limit=5
router.get("/", (req, res) => {
  const page = req.query.page || 1; // default page is 1
  const limit = req.query.limit || 10; // default limit (number of items per page) is 10
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const result = domains.slice(startIndex, endIndex);
  res.json(result);
});

// PUT /domain/:domainId
// update domain content
router.put("/:domainId", (req, res) => {
  const found = domains.find(
    (domain) => domain.domainId === req.params.domainId
  );

  if (found) {
    if (
      req.body.domainName &&
      domains.reduce(
        (total, domain) =>
          domain.domainName === req.body.domainName ? total + 1 : total,
        0
      ) > 0
    ) {
      res.status(400).json({ msg: "Domain name has been taken." });
    } // check whether the domain name you want update to already existed

    res.json({
      msg: "Domain updated",
      updatedDomain: Object.assign(found, req.body),
    });
  } else {
    res
      .status(400)
      .json({ msg: `No domain with the id of ${req.params.domainId}` });
  }
});

// GET /domain/byOwner/:ownerId
// Fetch list of domains of an owner by owner id
router.get("/byOwner/:ownerId", (req, res) => {
  const result = domains.filter(
    (domain) => domain.ownerId === req.params.ownerId
  );
  res.json(result);
});

// POST /domain/search?q=
// fuzzy search
// actually I think it should be a GET, but I am keeping the spec
router.post("/search", (req, res) => {
  const q = req.query.q || "";
  console.log(q);

  const result = searcher.search(q);

  res.json(result);
});

module.exports = router;
