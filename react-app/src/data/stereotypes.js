import { v4 } from "uuid";

export const stereotypes = [
  {
    id: v4(),
    name: "kind",
    value: "kind",
    explanation:
      "A rigid and relationally independent category that represents a general class of objects or individuals sharing a set of essential properties.",
    examples: "Vehicle can be considered as kind",
  },
  {
    id: v4(),
    name: "subkind",
    value: "subkind",
    explanation:
      "Rigid categories that are defined in relation to a unique substance sortal, which specifies the identity of an object or individual, and can be specialized by other subkinds, but cannot specialize more than one ultimate substance sortal.",
    examples: "Car, Bus",
  },
  {
    id: v4(),
    name: "phase",
    value: "phase",
    explanation: "Categories defined as part of a partition of a sortal.",
    examples: "Working, Not working, Non optimal",
  },
  {
    id: v4(),
    name: "role",
    value: "role",
    explanation:
      "Categories that capture relational properties shared by instances of a given sortal and are defined by their relationships to other entities.",
    examples: "Driver, Passenger, Mechanic",
  },
  {
    id: v4(),
    name: "collective",
    value: "collective",
    explanation:
      "Collections of endurant universals that have a uniform structure which requires that the sum of the minimum cardinality constraint on the members be at least 2.",
    examples: "Tyres, Seats, Transmission",
  },
  {
    id: v4(),
    name: "category",
    value: "category",
    explanation:
      "A type of mixin that represents a dispersive universal. It is composed of essential properties that are shared by different rigid sortals.",
    examples: "Electrical System, Transmission, Safety System",
  },
  {
    id: v4(),
    name: "rolemixin",
    value: "rolemixin",
    explanation:
      "A category that represents common, contingent, and relationally dependent properties shared by entities that play multiple roles. It captures common properties of roles played by instances of different substance sortals.",
    examples: "Years of Experience, Driving Experience",
  },
];