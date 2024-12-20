"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

import { columns } from "./columns";
import { DataTable } from "./data-table";

function ProfilePage() {
  const router = useRouter();
  const [communicationRating, setCommunicationRating] = useState();
  const [leadershipRating, setLeadershipRating] = useState();
  const [behaviourRating, setBehaviourRating] = useState();
  const [responsivenessRating, setResponsivenessRating] = useState();
  const [difficultConcepts, setDifficultConcepts] = useState();
  const [understoodConcepts, setUnderstoodConcepts] = useState();
  const [activitySummary, setActivitySummary] = useState();
  const [studentId, setStudentId] = useState();
  const [studentEmail, setStudentEmail] = useState();

  const [data, setData] = useState([]);

  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      router.push("/admin");
    }

    // get all students
    axios
      .get(process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND + "/students", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
        },
      })
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        if (error.response.status === 401) {
          toast.error("Please login to continue");
          localStorage.removeItem("admin-token");
          router.push("/admin");
        } else {
          toast.error("Something went wrong. Please try again");
        }
      });
  }, []);

  // get id by email
  const handleGetId = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND +
          `/student/${studentEmail}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
          },
        }
      );
      setCommunicationRating(response.data.communication_rating);
      setLeadershipRating(response.data.leadership_rating);
      setBehaviourRating(response.data.behaviour_rating);
      setResponsivenessRating(response.data.responsiveness_rating);

      setDifficultConcepts(response.data.difficult_concepts);
      setUnderstoodConcepts(response.data.understood_concepts);
      setActivitySummary(response.data.activity_summary);
      setStudentId(response.data.id);
    } catch (error) {
      if (error.response.status === 401) {
        toast.error("Please login to continue");
        localStorage.removeItem("admin-token");
        router.push("/admin");
      } else {
        toast.error("Something went wrong. Please try again");
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    // change the user detalis

    const user = {
      id: studentId,
      communication_rating: communicationRating,
      leadership_rating: leadershipRating,
      behaviour_rating: behaviourRating,
      responsiveness_rating: responsivenessRating,
      difficult_concepts: difficultConcepts,
      understood_concepts: understoodConcepts,
      activity_summary: activitySummary,
    };
    try {
      const response = await axios.put(
        process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND + `/admin/user`,
        user,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
          },
        }
      );
      toast.success("Profile updated successfully");

      //reset the form
      setCommunicationRating("");
      setLeadershipRating("");
      setBehaviourRating("");
      setResponsivenessRating("");
      setDifficultConcepts("");
      setUnderstoodConcepts("");
      setActivitySummary("");
      setStudentId("");
    } catch (error) {
      if (error.response.status === 401) {
        toast.error("Please login to continue");
        localStorage.removeItem("admin-token");
        router.push("/");
      } else {
        toast.error("Something went wrong. Please try again");
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND +
          `/student/id/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
          },
        }
      );
      toast.success("User deleted successfully");
      setCommunicationRating("");
      setLeadershipRating("");
      setBehaviourRating("");
      setResponsivenessRating("");
      setDifficultConcepts("");
      setUnderstoodConcepts("");
      setActivitySummary("");
      setStudentId("");
      setStudentEmail("");

      await axios
        .get(process.env.NEXT_PUBLIC_DOMAIN_NAME_BACKEND + "/students", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin-token")}`,
          },
        })
        .then((response) => {
          setData(response.data);
        });
    } catch (error) {
      if (error.response.status === 401) {
        toast.error("Please login to continue");
        localStorage.removeItem("admin-token");
        router.push("/");
      } else {
        toast.error("Something went wrong. Please try again");
      }
    }
  };

  return (
    <>
      <div className="flex bg-blue-900">
        <div className="flex flex-col p-10 gap-5 items-center bg-blue-950/50">
          <img src="/prof.png" className="h-10 w-10 rounded-full"></img>
          <div className="flex flex-col gap-5 text-white">
            <Link href="/admin/update">
              <button className="p-2 bg-blue-500 rounded-xl text-white">
                Back to Admin Home
              </button>
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-2 p-10">
            <h1 className="text-5xl animate-bounce font-bold text-center text-white">
              Obo Tutor
            </h1>
            <div className="flex flex-col gap-5">
              <div className="">
                <h3 className="text-left text-white text-xl">
                  Get Student Id by email
                </h3>
                {/* get user id by email */}
                <form onSubmit={handleGetId}>
                  <div className="flex gap-1">
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Email</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Email"
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="p-2 bg-blue-500 rounded-xl text-white"
                      >
                        Get Student Id
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-left text-white text-xl">
                  Edit User Profile
                </h3>

                <form onSubmit={handleProfileSubmit}>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Student ID</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Student ID"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Communication Rating</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Communication Rating"
                        value={communicationRating}
                        onChange={(e) => setCommunicationRating(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Leadership Rating</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Leadership Rating"
                        value={leadershipRating}
                        onChange={(e) => setLeadershipRating(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Behaviour Rating</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Behaviour Rating"
                        value={behaviourRating}
                        onChange={(e) => setBehaviourRating(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">
                        Responsiveness Rating
                      </label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Responsiveness Rating"
                        value={responsivenessRating}
                        onChange={(e) =>
                          setResponsivenessRating(e.target.value)
                        }
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Difficult Concepts</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Difficult Concepts"
                        value={difficultConcepts}
                        onChange={(e) => setDifficultConcepts(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Understood Concepts</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Understood Concepts"
                        value={understoodConcepts}
                        onChange={(e) => setUnderstoodConcepts(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-10 items-center">
                      <label className="text-white">Activity Summary</label>
                      <input
                        className="p-2 rounded-xl focus:outline-none outline-none active:outline-none"
                        type="text"
                        placeholder="Activity Summary"
                        value={activitySummary}
                        onChange={(e) => setActivitySummary(e.target.value)}
                      />
                    </div>

                    <div className="flex gap-10 py-3">
                      <button
                        type="submit"
                        className="p-2 bg-blue-500 rounded-xl hover:bg-blue-700 flex-1 text-white"
                      >
                        Save
                      </button>

                      {/* delete user */}
                    </div>
                  </div>
                </form>
                <button
                  className="p-2 bg-red-500 hover:bg-red-800 rounded-xl text-white"
                  onClick={handleDelete}
                >
                  Delete Student Profile
                </button>
              </div>

              <div>
                <h3 className="text-left text-white text-xl">All Students</h3>
                <DataTable columns={columns} data={data} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
