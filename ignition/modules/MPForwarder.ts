import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";

const MPForwarderModule = buildModule("MPForwarderModule", (m) => {
  const destination = m.getParameter("destination", hre.ethers.ZeroAddress);

  const mpForwarder = m.contract("MPForwarder", [destination]);

  return { mpForwarder };
});

export default MPForwarderModule;
