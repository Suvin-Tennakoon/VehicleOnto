import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { v4 } from "uuid";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { BiPlus } from "react-icons/bi";
import { MdDeleteOutline, MdLiveHelp } from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";

import { Modal, OPList } from "../components";
import { relationshipTypes } from "../data/relationshipTypes";
import { saveObjectProperties } from "../features/objectProperties/objectPropertySlice";
import {
	takeSOPmainTour,
	takeSOPmodalTour,
	takeSOPsingleRangeTour,
	takeSOPmultiRangeTour,
	takeSOPmultiRangeModalTour,
} from "../tour/simpleOPtour";
import axios from "axios";

const shortcutLabels = [
	{
		label: "has",
		value: "has",
	},
	{
		label: "collectionOf",
		value: "collectionOf",
	},
	{
		label: "partOf",
		value: "partOf",
	},
];

const SimpleOP = ({ setisSOPsubmitted, isAOPsubmitted }) => {
	const taxonomies = useSelector((store) => store.taxonomies);
	const savedObjectProperties = useSelector((store) => store.objectProperties);

	const dispatch = useDispatch();

	const [isSomeEnabled, setisSomeEnabled] = useState(false);
	const [isOnlyEnabled, setisOnlyEnabled] = useState(false);
	const [isAlertVisible, setisAlertVisible] = useState(false);
	const [isMainAlertVisible, setisMainAlertVisible] = useState(false);
	const [isOpModalVsible, setisOpModalVsible] = useState(false);
	const [isAddRangesModalVisible, setisAddRangesModalVisible] = useState(false);
	const [openTab, setopenTab] = useState(1);
	const [alertMsg, setalertMsg] = useState("");
	const [mainAlertMsg, setmainAlertMsg] = useState("");
	const [selectedLabel, setselectedLabel] = useState("");
	const [selectedDomain, setselectedDomain] = useState("");
	const [selectedRange, setselectedRange] = useState({});
	const [rangesList, setrangesList] = useState([]);
	const [selectedRelationshipTypes, setselectedRelationshipTypes] = useState(
		[]
	);
	const [rangeObject, setrangeObject] = useState({
		name: "",
		some: isSomeEnabled,
		only: isOnlyEnabled,
		min: 0,
		max: "inf",
		exactly: -1,
		relationshipTypes: [],
	});
	const [newOP, setnewOP] = useState({
		id: v4(),
		relationshipLabel: "",
		inverse: "",
		equivalentLabel: "",
		domain: "",
		ranges: [],
		isSimpleOP: true,
	});
	const [availableTaxonomies, setavailableTaxonomies] = useState([]);
	const [objectPropertyList, setobjectPropertyList] = useState([]);
	const [advancedOPList, setadvancedOPList] = useState([]);
	const [consistencyCheck, setConsistencyCheck] = useState("UNDEFINED");

	const [singleOPobject, setsingleOPobject] = useState({
		id: v4(),
		relationshipLabel: "relationships",
		sessionId: taxonomies.sessionId,
		subrelationships: [],
	});

	useEffect(() => {
		// console.log("taxonomies simpleOP: ", taxonomies)
		const taxonomyArray = [];
		const getTaxonomies = (subclasses) => {
			subclasses.forEach((subcls) => {
				taxonomyArray.push(subcls);
				if (subcls.subclasses.length > 0) {
					getTaxonomies(subcls.subclasses);
				}
			});
		};
		getTaxonomies(taxonomies?.subclasses);
		setavailableTaxonomies(taxonomyArray);
	}, [taxonomies.submitted]);

	useEffect(() => {
		const sop = savedObjectProperties.filter((obj) => obj.isSimpleOP);
		setobjectPropertyList(sop);
		const aop = savedObjectProperties.filter((obj) => !obj.isSimpleOP);
		setadvancedOPList(aop);
		// console.log("advancedOPList.length in SOP: ", advancedOPList.length)
	}, [savedObjectProperties]);

	const handleDomainSelect = (data) => {
		setselectedDomain(data);
		setnewOP({ ...newOP, domain: data.label });
	};
	const handleRangeSelect = (data) => {
		setselectedRange(data);
		setrangeObject({ ...rangeObject, name: data.label });
	};

	const handlerelationshipTypesSelect = (data) => {
		setselectedRelationshipTypes(data);
		let addedRelationshipTypes = [];
		data.forEach((d) => {
			addedRelationshipTypes.push(d.label);
		});
		setrangeObject({
			...rangeObject,
			relationshipTypes: addedRelationshipTypes,
		});
	};

	const handleLabelSelect = (data) => {
		setselectedLabel(data);
		setnewOP({ ...newOP, relationshipLabel: data.label });
	};

	const handleSetRangeObjToInit = () => {
		setselectedRange({});
		setselectedRelationshipTypes([]);
		setisSomeEnabled(false);
		setisOnlyEnabled(false);
		setrangeObject({
			name: "",
			some: false,
			only: false,
			min: 0,
			max: "inf",
			exactly: -1,
			relationshipTypes: [],
			isSimpleOP: true,
		});
	};

	const handleSetOPtoInit = () => {
		setselectedLabel("");
		setselectedDomain("");
		setnewOP({
			id: v4(),
			relationshipLabel: "",
			inverse: "",
			equivalentLabel: "",
			domain: "",
			ranges: [],
			isSimpleOP: true,
		});
		handleSetRangeObjToInit();
	};

	const handleAddObjectProperty = () => {
		if (newOP.relationshipLabel === "") {
			setisAlertVisible(true);
			setalertMsg("Please note that the Label field is required.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (newOP.domain === "") {
			setisAlertVisible(true);
			setalertMsg("Please select a domain.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (selectedRange === "") {
			setisAlertVisible(true);
			setalertMsg("Please select a range.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (newOP.inverse === "") {
			setisAlertVisible(true);
			setalertMsg("Please give an inverse.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (rangeObject.max < rangeObject.min) {
			setisAlertVisible(true);
			setalertMsg("Min value should be samaller than the Max value.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (newOP.domain === newOP.inverse) {
			setisAlertVisible(true);
			setalertMsg("Please note that domain and inverse cannot be the same.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (
			newOP.domain === rangeObject.name &&
			!rangeObject.relationshipTypes.includes("Reflexive")
		) {
			setisAlertVisible(true);
			setalertMsg(
				"If domain and the range are same, relationship type should be Reflexive."
			);
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (
			rangeObject.relationshipTypes.includes("functional") &&
			rangeObject.ranges.includes("transitive")
		) {
			setisAlertVisible(true);
			setalertMsg("If a property is transitive then it CANNOT be functional.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else {
			setobjectPropertyList([
				...objectPropertyList,
				{ ...newOP, ranges: rangeObject },
			]);
			handleSetOPtoInit();
			// console.log("objectPropertyList: ", objectPropertyList)
		}
	};

	const handleModalOpen = () => {
		setisOpModalVsible(true);
		setisSOPsubmitted(false);
	};

	const handleModalClose = () => {
		setisOpModalVsible(false);
		handleSetOPtoInit();
	};

	const handleMultiRangeModalCancel = () => {
		setisAddRangesModalVisible(false);
		handleSetRangeObjToInit();
		setrangesList([]);
	};

	const handleSaveObjectProperties = () => {
		if (rangesList.length < 2) {
			setisAlertVisible(true);
			setalertMsg(
				"You are in multi-range entry Tab. Therefore, please add at least two ranges."
			);
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else {
			// console.log("rangesList: ", rangesList)
			setobjectPropertyList([
				...objectPropertyList,
				{ ...newOP, ranges: rangesList },
			]);
			setisAddRangesModalVisible(false);
			handleSetOPtoInit();
			setrangesList([]);
			// console.log("objectPropertyList: ", objectPropertyList)
		}
	};

	const handleAddMultipleRanges = () => {
		if (newOP.relationshipLabel === "" || newOP.domain === "") {
			setisAlertVisible(true);
			setalertMsg("Before adding ranges, give a label and a domain.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else {
			setisAddRangesModalVisible(true);
		}
	};

	const handleAddSingleRange = () => {
		if (rangeObject.name === "") {
			setisAlertVisible(true);
			setalertMsg("Please select a range.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (parseFloat(rangeObject.max) < parseFloat(rangeObject.min)) {
			setisAlertVisible(true);
			setalertMsg("Min value should be smaller than the Max value.");
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else if (
			newOP.relationshipLabel === "collectionOf" &&
			rangeObject.min < 2
		) {
			setisAlertVisible(true);
			setalertMsg(
				"Please note that ranges relate with the collectionOf property should have 2 or more for their min value."
			);
			setTimeout(() => {
				setisAlertVisible(false);
			}, 4000);
		} else {
			const isNameExists = rangesList.some(
				(range) => range.name === rangeObject.name
			);
			if (isNameExists) {
				setisAlertVisible(true);
				setalertMsg("No duplications are allowed.");
				setTimeout(() => {
					setisAlertVisible(false);
				}, 3000);
			} else {
				setrangesList([...rangesList, rangeObject]);
				handleSetRangeObjToInit();
			}
		}
	};

	const handleRangeDelete = (index) => {
		const updatedRangeList = [...rangesList];
		updatedRangeList.splice(index, 1);
		setrangesList(updatedRangeList);
	};

	const handleSubmitAllSOP = () => {
		// console.log("objectPropertyList: ", objectPropertyList)
		if (objectPropertyList.length === 0) {
			setisMainAlertVisible(true);
			setmainAlertMsg("Please at at least one object property.");
			setTimeout(() => {
				setisMainAlertVisible(false);
			}, 3000);
		} else {
			const finalOPlist = objectPropertyList.filter(
				(obj, index, self) => index === self.findIndex((t) => t.id === obj.id)
			);
			setobjectPropertyList(finalOPlist);
			dispatch(
				saveObjectProperties({
					newOPList: finalOPlist,
					prevOPList: advancedOPList,
				})
			);
			setisSOPsubmitted(true);
			console.log("finalOPlist SOP: ", JSON.stringify(finalOPlist));
			// console.log("savedObjectProperties SOP: ", savedObjectProperties)
		}
	};

	const handleCheckConsistency = async () => {
		setConsistencyCheck("LOADING");
		setsingleOPobject({
			...singleOPobject,
			subrelationships: objectPropertyList,
		});

		const updatedSubrelationships = singleOPobject.subrelationships.map(
			(subrel) => {
				return {
					...subrel,
					ranges: [subrel.ranges],
				};
			}
		);

		const modifiedJson = {
			...singleOPobject,
			subrelationships: updatedSubrelationships,
		};

		console.log("singleobject", JSON.stringify(modifiedJson));
		let config = {
			method: "post",
			maxBodyLength: Infinity,
			url: `${process.env.REACT_APP_BACKEND_URL}/flask/checkpoint_2/op_generate/consistency`,
			headers: {
				"Content-Type": "application/json",
			},
			data: modifiedJson,
		};

		axios
			.request(config)
			.then((response) => {
				console.log(response);
				if (response.data.type === "success") {
					setConsistencyCheck("CONSISTENT");
				} else {
					setConsistencyCheck("NOT_CONSISTENT");
				}
			})
			.catch((error) => {
				setConsistencyCheck("CONSISTENT_ERR");
				console.log(error);
			});
	};

	return (
		<div className="w-full h-full">
			<div className="flex items-center justify-between mb-2">
				<div className="flex">
					<p className="taxonomy-heading mt-1">Add Simple Object Properties</p>
					<button
						className="border-0"
						onClick={handleModalOpen}
						disabled={!taxonomies.submitted}
					>
						<BiPlus
							className={`biplus_modal ${
								!taxonomies.submitted ? "cursor-not-allowed" : ""
							}`}
							id="add_simpleOP_icon"
						/>
					</button>
				</div>
				<MdLiveHelp
					className="text-secondary text-xl cursor-pointer hover:text-primary"
					onClick={takeSOPmainTour}
				/>
			</div>

			{isMainAlertVisible && (
				<div className="flex w-fit mx-4 py-1 px-2 bg-primary text-white font-semibold rounded-md mt-4">
					<TbAlertTriangle className="mr-2 mt-1" />
					<p>{mainAlertMsg}</p>
				</div>
			)}

			<div className="flex w-fit mx-4 py-1 px-2 bg-secondary text-white font-semibold rounded-md mt-4">
				{consistencyCheck === "UNDEFINED" && <p>Consistency: Not checked</p>}
				{consistencyCheck === "LOADING" && <p>Consistency: Checking...</p>}
				{consistencyCheck === "CONSISTENT" && <p>OWL is consistent</p>}
				{consistencyCheck === "NOT_CONSISTENT" && <p>OWL is not consistent</p>}
			</div>

			<div id="simpleOP_list" className="w-full h-3/4 overflow-y-scroll">
				<OPList
					objectPropertyList={objectPropertyList}
					setobjectPropertyList={setobjectPropertyList}
				/>
			</div>

			<div className="flex w-full items-center justify-center">
				<button
					className={`primary_btn_comp w-auto px-5 h-fit mt-4 ${
						!taxonomies.submitted || isAOPsubmitted ? "disabled_btn" : ""
					}`}
					onClick={handleSubmitAllSOP}
					disabled={!taxonomies.submitted || isAOPsubmitted}
					id="submitAll_SOP"
				>
					Submit
				</button>
				{consistencyCheck === "LOADING" ? (
					<p className="w-auto px-5 h-fit mt-4">Checking...</p>
				) : (
					<button
						className={`secondary_btn_comp w-auto px-5 h-fit mt-4 ${
							!taxonomies.submitted || isAOPsubmitted ? "disabled_btn" : ""
						}`}
						disabled={!taxonomies.submitted || isAOPsubmitted}
						onClick={handleCheckConsistency}
						id="check_SOP_consistency"
					>
						Check Consistency
					</button>
				)}
			</div>

			<Modal
				open={isOpModalVsible}
				onClose={() => setisOpModalVsible(false)}
				fromTop="top-[12%]"
				fromLeft="left-[15%]"
			>
				<div className="flex items-center justify-between w-full mb-2">
					<div className="flex">
						<p className="modal_title">
							Simple Object Property {openTab === 1 ? "1" : "2"}
						</p>
						<MdLiveHelp
							className="text-secondary text-xl cursor-pointer hover:text-primary mt-1 ml-2"
							onClick={takeSOPmodalTour}
						/>
					</div>
					<AiOutlineCloseCircle
						onClick={() => setisOpModalVsible(false)}
						className="modal_close_icon"
					/>
				</div>

				{isAlertVisible && (
					<div className="alert_style">
						<TbAlertTriangle className="mr-2" />
						<p>{alertMsg}</p>
					</div>
				)}

				<div className="flex flex-wrap w-full">
					<div className="w-full">
						<ul
							className="flex mb-0 list-none flex-wrap py-2 flex-row"
							role="tablist"
						>
							<li
								className="-mb-px mr-2 last:mr-0 flex-auto text-center"
								id="single_range_entry"
							>
								<a
									className={
										"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded flex justify-between items-center leading-normal " +
										(openTab === 1
											? "text-white bg-secondary"
											: "text-secondary bg-white")
									}
									data-toggle="tab"
									href="#link1"
									role="tablist"
								>
									<p
										className="w-fit"
										onClick={() => {
											setopenTab(1);
										}}
									>
										Single Range Entry
									</p>
									<MdLiveHelp
										className="text-xl cursor-pointer ml-2 hover:text-primary"
										onClick={takeSOPsingleRangeTour}
									/>
								</a>
							</li>

							<li
								className="-mb-px mr-2 last:mr-0 flex-auto text-center"
								id="multi_range_entry"
							>
								<a
									className={
										"text-xs font-bold uppercase px-5 py-3 shadow-lg rounded flex justify-between leading-normal " +
										(openTab === 2
											? "text-white bg-secondary"
											: "text-secondary bg-white")
									}
									data-toggle="tab"
									href="#link2"
									role="tablist"
								>
									<p className="w-fit" onClick={() => setopenTab(2)}>
										Multi-range Entry
									</p>
									<MdLiveHelp
										className="text-xl cursor-pointer ml-2 hover:text-primary"
										onClick={takeSOPmultiRangeTour}
									/>
								</a>
							</li>
						</ul>

						<div className="relative flex flex-col min-w-0 break-words w-full rounded">
							<div className="px-4 py-2 flex-auto">
								<div className="tab-content tab-space">
									<div
										className={openTab === 1 ? "block" : "hidden"}
										id="link1"
									>
										<div className="flex flex-col gap-4">
											<div className="grid grid-cols-3 gap-4">
												<div className="flex flex-col">
													<p className="mb-1" id="sop_label">
														Label*{" "}
													</p>
													<input
														type="text"
														className="border p-2 rounded-sm"
														value={newOP.relationshipLabel}
														placeholder="growsIn"
														onChange={(e) =>
															setnewOP({
																...newOP,
																relationshipLabel: e.target.value,
															})
														}
													/>
												</div>

												<div className="flex flex-col" id="sop_inverse">
													<p className="mb-1">Inverse* </p>
													<input
														type="text"
														className="border p-2 rounded-sm"
														value={newOP.inverse}
														placeholder="isGrownBy"
														onChange={(e) =>
															setnewOP({ ...newOP, inverse: e.target.value })
														}
													/>
												</div>

												<div className="flex flex-col" id="sop_equivalentname">
													<p className="mb-1">Equivalent name </p>
													<input
														type="text"
														className="border p-2 rounded-sm"
														value={newOP.equivalentLabel}
														placeholder="suitableFor"
														onChange={(e) =>
															setnewOP({
																...newOP,
																equivalentLabel: e.target.value,
															})
														}
													/>
												</div>
											</div>

											<div className="grid grid-cols-3 gap-4">
												<div className="flex flex-col" id="sop_domain">
													<p className="mb-1">Domain* </p>
													<Select
														options={availableTaxonomies}
														placeholder="Select"
														value={selectedDomain}
														onChange={handleDomainSelect}
													/>
												</div>

												<div className="flex flex-col" id="sop_range">
													<p className="mb-1">Range* </p>
													<Select
														options={availableTaxonomies}
														placeholder="Select"
														value={selectedRange}
														onChange={handleRangeSelect}
													/>
												</div>

												<div
													className="flex flex-col justify-center"
													id="sop_quantifiers"
												>
													<p className="mb-1">Add quantifiers </p>

													<div className="flex">
														<label className="label_style">
															<input
																type="checkbox"
																className="sr-only peer"
																checked={isSomeEnabled}
																onClick={() =>
																	setrangeObject({
																		...rangeObject,
																		some: !isSomeEnabled,
																	})
																}
																onChange={() =>
																	setisSomeEnabled(!isSomeEnabled)
																}
															/>
															<div className="w-11 h-6 bg-lightgray rounded-full peer  peer-focus:ring-secondary  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-lightgray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
															<span className="ml-2 text-sm font-medium text-fontcolor">
																Some
															</span>
														</label>

														<label className="label_style">
															<input
																type="checkbox"
																className="sr-only peer"
																checked={isOnlyEnabled}
																onClick={() =>
																	setrangeObject({
																		...rangeObject,
																		only: !isOnlyEnabled,
																	})
																}
																onChange={() =>
																	setisOnlyEnabled(!isOnlyEnabled)
																}
															/>
															<div className="w-11 h-6 bg-lightgray rounded-full peer  peer-focus:ring-secondary  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-lightgray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
															<span className="ml-2 text-sm font-medium text-fontcolor">
																Only
															</span>
														</label>
													</div>
												</div>
											</div>

											<div className="flex flex-col gap-4">
												<div
													className="flex flex-col"
													id="sop_relationship_types"
												>
													<p className="mb-1">Relationship Type(s) </p>
													<Select
														options={relationshipTypes}
														placeholder="Select"
														value={selectedRelationshipTypes}
														onChange={handlerelationshipTypesSelect}
														isMulti={true}
													/>
												</div>
											</div>

											<div
												className="flex flex-col gap-4 w-3/4"
												id="sop_constraints"
											>
												<div className="flex w-full items-center justify-between">
													<p className="mb-1">Add constraints </p>

													<div className="flex items-center justify-center gap-2">
														<p className="mb-1 text-sm">Min* </p>
														<input
															type="text"
															className="border p-2 rounded-sm w-16 h-8"
															value={rangeObject.min}
															placeholder="suitableFor"
															onChange={(e) =>
																setrangeObject({
																	...rangeObject,
																	min: e.target.value,
																})
															}
														/>
													</div>

													<div className="flex items-center justify-center gap-2">
														<p className="mb-1 text-sm">Max* </p>
														<input
															type="text"
															className="border p-2 rounded-sm w-16 h-8"
															value={rangeObject.max}
															placeholder="suitableFor"
															onChange={(e) =>
																setrangeObject({
																	...rangeObject,
																	max: e.target.value,
																})
															}
														/>
													</div>

													<div className="flex items-center justify-center gap-2">
														<p className="mb-1 text-sm">Exactly </p>
														<input
															type="text"
															className="border p-2 rounded-sm w-16 h-8"
															value={rangeObject.exactly}
															placeholder="suitableFor"
															onChange={(e) =>
																setrangeObject({
																	...rangeObject,
																	exactly: e.target.value,
																})
															}
														/>
													</div>
												</div>
											</div>
										</div>
										<div className="flex justify-center items-center w-full mt-4">
											<button
												className="secondary_btn_comp w-fit h-8 py-0 px-2"
												onClick={handleAddObjectProperty}
												id="add_sop"
											>
												Add Object Property
											</button>

											<button
												className="primary_btn_comp h-8 p-0"
												onClick={handleModalClose}
												id="cancel_sop"
											>
												Cancel
											</button>
										</div>
									</div>

									{/* tab 2------------------------------------- */}
									<div
										className={openTab === 2 ? "block" : "hidden"}
										id="link2"
									>
										<div className="grid grid-cols-3 gap-4 justify-center items-end">
											<div className="flex flex-col" id="sop__label">
												<p className="mb-1">Label* </p>
												<Select
													options={shortcutLabels}
													placeholder="Select"
													value={selectedLabel}
													onChange={handleLabelSelect}
												/>
											</div>

											<div className="flex flex-col" id="sop__domain">
												<p className="mb-1">Domain* </p>
												<Select
													options={availableTaxonomies}
													placeholder="Select"
													value={selectedDomain}
													onChange={handleDomainSelect}
												/>
											</div>

											<button
												className="secondary_btn_comp w-fit h-8 py-0 px-2"
												onClick={handleAddMultipleRanges}
												id="add_multiRanges"
											>
												Add Multiple Ranges
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Modal>

			<Modal
				open={isAddRangesModalVisible}
				onClose={() => setisAddRangesModalVisible(false)}
				fromTop="top-[12%]"
				fromLeft="left-[15%]"
			>
				<div className="flex items-center justify-between w-full mb-4">
					<div className="flex gap-2 justify-center">
						<p className="modal_title">
							Add Multiple Ranges to{" "}
							<span className="text-primary">
								{newOP.domain} {newOP.relationshipLabel}
							</span>
						</p>
						<MdLiveHelp
							className="text-secondary mt-1 text-xl cursor-pointer hover:text-primary"
							onClick={takeSOPmultiRangeModalTour}
						/>
					</div>
					<AiOutlineCloseCircle
						onClick={() => setisAddRangesModalVisible(false)}
						className="modal_close_icon"
					/>
				</div>
				<p className="w-full flex items-center justify-center font-semibold text-fontcolor mb-2">
					{newOP.domain} {newOP.relationshipLabel}
				</p>

				{isAlertVisible && (
					<div className="alert_style">
						<TbAlertTriangle className="mr-2" />
						<p>{alertMsg}</p>
					</div>
				)}

				<div className="flex flex-col gap-4 text-fontcolor">
					<div className="grid grid-cols-3 gap-2">
						<div className="col-span-1">
							<div className="flex flex-col" id="sop__range">
								<p className="mb-1">Range* </p>
								<Select
									options={availableTaxonomies}
									placeholder="Select"
									value={selectedRange}
									onChange={handleRangeSelect}
								/>
							</div>
						</div>
						<div className="col-span-2">
							<div className="flex flex-col" id="sop_relationshiptypes">
								<p className="mb-1">Relationship Type(s) </p>
								<Select
									options={relationshipTypes}
									placeholder="Select"
									value={selectedRelationshipTypes}
									onChange={handlerelationshipTypesSelect}
									isMulti={true}
								/>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-6 gap-4">
						<div className="col-span-2">
							<div
								className="flex flex-col gap-2 justify-center"
								id="sop__quantifiers"
							>
								<p className="mb-1">Add quantifiers </p>

								<div className="flex">
									<label className="label_style">
										<input
											type="checkbox"
											className="sr-only peer"
											checked={isSomeEnabled}
											onClick={() =>
												setrangeObject({ ...rangeObject, some: !isSomeEnabled })
											}
											onChange={() => setisSomeEnabled(!isSomeEnabled)}
										/>
										<div className="w-11 h-6 bg-lightgray rounded-full peer  peer-focus:ring-secondary  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-lightgray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
										<span className="ml-2 text-sm font-medium text-fontcolor">
											Some
										</span>
									</label>

									<label className="label_style">
										<input
											type="checkbox"
											className="sr-only peer"
											checked={isOnlyEnabled}
											onClick={() =>
												setrangeObject({ ...rangeObject, only: !isOnlyEnabled })
											}
											onChange={() => setisOnlyEnabled(!isOnlyEnabled)}
										/>
										<div className="w-11 h-6 bg-lightgray rounded-full peer  peer-focus:ring-secondary  peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-lightgray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
										<span className="ml-2 text-sm font-medium text-fontcolor">
											Only
										</span>
									</label>
								</div>
							</div>
						</div>

						<div
							className="flex flex-col gap-2 w-full col-span-3"
							id="sop__constraints"
						>
							<p className="mb-1">Add constraints </p>

							<div className="flex gap-2">
								<div className="flex items-center justify-center gap-2">
									<p className="mb-1 text-sm">Min* </p>
									<input
										type="text"
										className="border p-2 rounded-sm w-16 h-8"
										value={rangeObject.min}
										placeholder="suitableFor"
										onChange={(e) =>
											setrangeObject({ ...rangeObject, min: e.target.value })
										}
									/>
								</div>

								<div className="flex items-center justify-center gap-2">
									<p className="mb-1 text-sm">Max* </p>
									<input
										type="text"
										className="border p-2 rounded-sm w-16 h-8"
										value={rangeObject.max}
										placeholder="suitableFor"
										onChange={(e) =>
											setrangeObject({ ...rangeObject, max: e.target.value })
										}
									/>
								</div>

								<div className="flex items-center justify-center gap-2">
									<p className="mb-1 text-sm">Exactly </p>
									<input
										type="text"
										className="border p-2 rounded-sm w-16 h-8"
										value={rangeObject.exactly}
										placeholder="suitableFor"
										onChange={(e) =>
											setrangeObject({
												...rangeObject,
												exactly: e.target.value,
											})
										}
									/>
								</div>
							</div>
						</div>
						<div className="col-span-1 flex items-end justify-end">
							<button
								className="secondary_btn_comp w-20 h-8 py-0 px-2"
								onClick={handleAddSingleRange}
								id="sop_addRange"
							>
								Add
							</button>
						</div>
					</div>
				</div>

				<table
					className="mt-8 w-full text-fontcolor table-auto"
					id="sop_addedMultiRange"
				>
					<thead className="flex w-full text-left">
						<tr className="tracking-normal flex w-full">
							<th className="w-1/5">Range</th>
							{/* <th className="w-2/5">Relationship types</th> */}
							<th className="w-1/5">Some</th>
							<th className="w-1/5">Only</th>
							<th className="w-1/5">Min</th>
							<th className="w-1/5">Max</th>
							<th className="w-1/5">Exactly</th>
							<th className="w-1/5">del</th>
						</tr>
					</thead>

					<tbody className="text-sm h-32 flex flex-col overflow-y-auto w-full">
						{rangesList?.map((singlerange, index) => (
							<tr
								className="flex even:bg-gray-100 w-full justify-between text-left"
								key={index}
							>
								<td className="pl-2 py-2 w-1/5">{singlerange.name}</td>
								{/* <td className="pl-2 py-2 w-2/5 flex gap-2">{singlerange.relationshipTypes?.map((rt, index) => (
                                    <p key={index}>{rt}</p>
                                ))}</td> */}
								<td className="pl-2 py-2 w-1/5">
									{singlerange.some ? "true" : "false"}
								</td>
								<td className="pl-2 py-2 w-1/5">
									{singlerange.only ? "true" : "false"}
								</td>
								<td className="pl-2 py-2 w-1/5">{singlerange.min}</td>
								<td className="pl-2 py-2 w-1/5">{singlerange.max}</td>
								<td className="pl-2 py-2 w-1/5">{singlerange.exactly}</td>
								<td className="pl-2 py-2 w-1/5">
									<MdDeleteOutline
										className="mt-1 mr-1 text-primary text-sm cursor-pointer"
										onClick={() => handleRangeDelete(index)}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				<div className="flex items-center justify-center mt-4 w-full">
					<button
						className="secondary_btn_comp h-10"
						onClick={handleSaveObjectProperties}
						id="save_sop_multiRanges"
					>
						Save all
					</button>
					<button
						className="primary_btn_comp h-10"
						onClick={handleMultiRangeModalCancel}
						id="cancel__sop"
					>
						Cancel
					</button>
				</div>
			</Modal>
		</div>
	);
};

export default SimpleOP;
