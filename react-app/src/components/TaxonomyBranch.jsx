import React, { useEffect, useState } from "react";
import { AiOutlineDown, AiOutlineCloseCircle } from 'react-icons/ai';
import { BiPlus, BiChevronDown, BiEditAlt } from "react-icons/bi";
import { MdDeleteOutline, MdLiveHelp } from "react-icons/md";
import { TbAlertTriangle } from "react-icons/tb";
import { v4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import "driver.js/dist/driver.min.css";

import Modal from "./Modal";
import { saveSubclass } from "../features/taxonomies/taxonomySlice";
import { setSelectedTaxonomy } from "../features/taxonomies/selectedTaxonomySlice";
import { stereotypes } from "../data/stereotypes";
import UpdateTaxonomyModal from "./UpdateTaxonomyModal";
import DeleteTaxonomyModal from "./DeleteTaxonomyModal";
import { takeAddSubclsTaxonomyTour } from "../tour/taxonomyTour";

const TaxonomyBranch = ({ taxonomy, taxonomyStyle = "taxonomy-name" }) => {
	const taxonomies = useSelector((store) => store.taxonomies);

	const [branchVisiblity, setbranchVisiblity] = useState(true);
	const [isModalOpen, setisModalOpen] = useState(false);
	const [isDeleteModalVisible, setisDeleteModalVisible] = useState(false);
	const [isUpdateModalVisible, setisUpdateModalVisible] = useState(false);
	const [isDropdownVisible, setisDropdownVisible] = useState(false);
	const [isAlertVisible, setisAlertVisible] = useState(false);
    const [showStereotypesDetails, setshowStereotypesDetails] = useState(false);
	const [alertMsg, setalertMsg] = useState("");
	const [selectedStereotype, setselectedStereotype] = useState(stereotypes[0]);
	const [availableSubclasses, setavailableSubclasses] = useState([]);
	const [newClass, setnewClass] = useState({
		id: "",
		name: "",
		stereotype: stereotypes[0].value,
		equivalentClass: "",
	});

	const dispatch = useDispatch();

	useEffect(() => {
		// console.log('useEffect in TaxonomyBranch')
		setavailableSubclasses([]);
		const findAvailableSubclsses = (taxonomyObj) => {
			if (taxonomyObj.id === taxonomy.id) {
				if (taxonomyObj.hasOwnProperty("subclasses")) {
					setavailableSubclasses(taxonomyObj.subclasses);
				}
			} else {
				if (taxonomyObj.hasOwnProperty("subclasses")) {
					taxonomyObj.subclasses?.map((subCls) =>
						findAvailableSubclsses(subCls)
					);
				}
			}
		};
		findAvailableSubclsses(taxonomies);
	}, [taxonomies, taxonomy]);

	const hanldeBranchVisibility = () => {
		setbranchVisiblity(!branchVisiblity);

		let overlapclasses = [];
		let disjointclasses = [];
		let propertiesList = [];
		if (taxonomy.hasOwnProperty("disjoint")) {
			disjointclasses = taxonomy.disjoint;
		}
		if (taxonomy.hasOwnProperty("overlap")) {
			overlapclasses = taxonomy.overlap;
		}
		if (taxonomy.hasOwnProperty("propertiesList")) {
			propertiesList = taxonomy.propertiesList;
		}

		dispatch(
			setSelectedTaxonomy({
				id: taxonomy.id,
				name: taxonomy.name,
				subclasses: taxonomy.subclasses,
				propertiesList: propertiesList,
				disjoint: disjointclasses,
				overlap: overlapclasses,
			})
		);
	};

	const handleAddClass = () => {
		setbranchVisiblity(true);
		setisModalOpen(true);
	};

	const handleKeyDown = (event) => {
        if (event) {
            if (event.key === 'Enter') {
                handleSaveClass()
            }
        } else {
            setalertMsg(
				"No event is passed"
			);
			setisAlertVisible(true);
			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
        }
    }

	const handleSaveClass = () => {
		if (newClass.name?.length === 0) {
			setisAlertVisible(true);
			setalertMsg("Please note that Class name field is required.");

			setTimeout(() => {
				setisAlertVisible(false);
			}, 3000);
		} else {
			let nameDuplication = availableSubclasses.filter(
				(subCls) => subCls.name === newClass.name
			);

			if (nameDuplication.length > 0) {
				setisAlertVisible(true);
				setalertMsg("Class name already exists.");

				setTimeout(() => {
					setisAlertVisible(false);
				}, 3000);
			} else if (taxonomy.name === newClass.name) {
				setisAlertVisible(true);
				setalertMsg("A subclass cannot have its parent's name.");

				setTimeout(() => {
					setisAlertVisible(false);
				}, 3000);
			} else {
				dispatch(
					saveSubclass({
						id: v4(),
						name: newClass.name,
						stereotype: newClass.stereotype,
						equivalentClass: newClass.equivalentClass,
						parentId: taxonomy.id,
					})
				);
				setselectedStereotype(stereotypes[0]);
				setnewClass({
					id: "",
					name: "",
					stereotype: stereotypes[0].value,
					equivalentClass: "",
				});
			}
		}
	};

	return (
    <div key={taxonomy.id} className="text-fontcolor ">
      <div className="flex mt-1 text-fontcolor tracking-wider p-1">
        <span className="w-4 h-4 border-l-2 border-b-2 mr-1"></span>
        <p className={taxonomyStyle} onClick={hanldeBranchVisibility}>
          {taxonomy.name}
        </p>
        {taxonomy.name !== "taxonomies" && !taxonomies.submitted && (
          <>
            <BiEditAlt
              className="ml-2 cursor-pointer  text-lg"
              onClick={() => setisUpdateModalVisible(true)}
            />
            <MdDeleteOutline
              className="ml-2 cursor-pointer text-primary text-lg"
              onClick={() => setisDeleteModalVisible(true)}
            />
          </>
        )}
        {!taxonomies.submitted && (
          <BiPlus
            className="ml-2 cursor-pointer bg-secondary text-white hover:bg-primary hover:text-white transition rounded-full text-lg"
            onClick={handleAddClass}
          />
        )}
      </div>

      {branchVisiblity &&
        taxonomy.subclasses?.map((subCls) => (
          <div className="pl-4" key={subCls.id}>
            <TaxonomyBranch taxonomy={subCls} />
          </div>
        ))}

      <Modal
        open={isModalOpen}
        onClose={() => setisModalOpen(false)}
        fromTop="top-[15%]"
      >
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center justify-center gap-4">
            <p className="modal_title">
              Add subclasses to{" "}
              <span className="font-bold text-secondary">{taxonomy.name}</span>{" "}
              class.
            </p>
            <MdLiveHelp
              className="tour_icon"
              onClick={takeAddSubclsTaxonomyTour}
            />
          </div>
          <AiOutlineCloseCircle
            onClick={() => setisModalOpen(false)}
            className="modal_close_icon"
          />
        </div>

        {isAlertVisible && (
          <div className="alert_style">
            <TbAlertTriangle className="mr-2" />
            <p>{alertMsg}</p>
          </div>
        )}

        <div className="flex flex-col" onKeyDown={handleKeyDown}>
          <div className="flex gap-6 items-end">
            <div className="flex gap-4 items-center">
              <div className="flex flex-col gap-2" id="taxonomy_classname">
                <p>Class name*</p>
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded-md outline-secondary"
                  placeholder="Vehicle"
                  value={newClass.name}
                  onChange={(e) =>
                    setnewClass({ ...newClass, name: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col gap-2" id="taxonomy_stereotype">
                <p>Stereotype*</p>
                <div className="custom-dropdown relative w-28">
                  <div
                    className="custom-dropdown-selection bg-white rounded-md cursor-pointer p-2 border w-full outline-secondary"
                    onClick={() => {
                      setisDropdownVisible(!isDropdownVisible);
                    }}
                  >
                    {selectedStereotype !== null && (
                      <p className="flex items-center justify-between">
                        {selectedStereotype.name}
                        <BiChevronDown />
                      </p>
                    )}
                  </div>

                  <div className="items-holder rounded-md bg-white absolute top-[100%] mt-2 border w-full">
                    {isDropdownVisible &&
                      stereotypes.map((item) => (
                        <div
                          className="dropdown-item p-2 cursor-pointer hover:bg-slate-200"
                          key={item.id}
                          onClick={() => {
                            setselectedStereotype(item);
                            setisDropdownVisible(false);
                            setnewClass({ ...newClass, stereotype: item.name });
                          }}
                        >
                          {item.id !== selectedStereotype.id && (
                            <p>{item.name}</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div
                className="flex flex-col gap-2"
                id="taxonomy_equivalentclass"
              >
                <p>Equivalent Class</p>
                <input
                  type="text"
                  className="p-2 border border-gray-300 rounded-md outline-secondary"
                  placeholder="Auto"
                  value={newClass.equivalentClass}
                  onChange={(e) =>
                    setnewClass({
                      ...newClass,
                      equivalentClass: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              className="secondary_btn_comp h-10 mr-0"
              onClick={handleSaveClass}
              onKeyDown={handleKeyDown}
              id="save_taxonomybranch"
            >
              Save Class
            </button>
          </div>

          <div className="mt-8 text-justify w-full" id="stereotypes_list">
            <div className="flex text-sm font-semibold text-gray-500 mb-2">
              <h1>Stereotypes List Explanation</h1>
              <span
                className="mt-1 ml-2 text-xs font-bold cursor-pointer"
                onClick={() =>
                  setshowStereotypesDetails(!showStereotypesDetails)
                }
              >
                <AiOutlineDown />
              </span>
            </div>
            {showStereotypesDetails && (
              <div className="w-full">
                {stereotypes.map((item, index) => (
                  <div>
                    <p className="text-xs" key={index}>
                      {" "}
                      <span className="font-semibold">{item.name}</span> -{" "}
                      {item.explanation} Ex: {item.examples}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {isDeleteModalVisible && (
        <DeleteTaxonomyModal
          open={isDeleteModalVisible}
          onClose={() => setisDeleteModalVisible(false)}
          taxonomy={taxonomy}
        />
      )}

      {isUpdateModalVisible && (
        <UpdateTaxonomyModal
          open={isUpdateModalVisible}
          onClose={() => setisUpdateModalVisible(false)}
          taxonomy={taxonomy}
        />
      )}
    </div>
  );
};

export default TaxonomyBranch;