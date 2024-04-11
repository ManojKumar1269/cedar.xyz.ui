import { useEffect, useState, useRef } from "react";
import { API_URL } from "./../../constant";
import "./home.css";
import { isExpired } from "./../../constant";
import { v4 as uuidv4 } from "uuid";

function Home({ routeChange }) {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [issueLoading, setIssueLoading] = useState(null);
  const [newIssue, setNewIssue] = useState("");
  const [newChat, setNewChat] = useState("");
  const [newIssueVisible, setNewIssueVisible] = useState(false);
  const chatboxRef = useRef();
  const [isOpenAI, setOpenAI] = useState(true);
  const [file, setFile] = useState(undefined);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [docs, setDocs] = useState([]);

  useEffect(() => {

    if (chatboxRef && chatboxRef.current && chats && chats.length > 0) {
      chatboxRef.current.querySelector(`.chat-message:nth-of-type(${chats.length})`).scrollIntoView({ behavior: "smooth" });  
    }
  });


  useEffect(() => {
    const userLocal = JSON.parse(window.localStorage.getItem("user"));
    if (
      !userLocal ||
      (userLocal.access_token &&
        userLocal._id &&
        userLocal.access_token_expires &&
        isExpired(userLocal.access_token_expires))
    ) {
      window.localStorage.removeItem("user");
      routeChange("login");
    } else {
      try {
        setUser(userLocal);
        fetch(`${API_URL}/issues`, {
          method: "GET",
          headers: {
            Authorization: "Bearer " + userLocal.access_token,
          },
        })
          .then((response) => response.json())
          .then((issuesData) => {
            setIssues(issuesData);
            let firstIssue = issuesData[0];
            setSelectedIssue(firstIssue);
            fetch(`${API_URL}/chats/${firstIssue._id}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + userLocal.access_token,
              },
            })
              .then((response) => response.json())
              .then((chatsData) => {
                setChats(chatsData);
              });

            fetch(`${API_URL}/collections`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + userLocal.access_token,
              },
            })
              .then((response) => response.json())
              .then((coll) => {
                setDocs(coll);
              });
          });
      } catch (e) {
        routeChange("not-found");
      }
    }
  }, []);

  const onLogout = (event) => {
    event.preventDefault();

    window.localStorage.removeItem("user");
    routeChange("login");
  };

  const handleOnIssue = (issue) => {
    setIssueLoading(true);
    setSelectedIssue(issue);
    fetch(`${API_URL}/chats/${issue._id}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + user.access_token,
      },
    })
      .then((response) => response.json())
      .then((chatsData) => {
        setChats(chatsData);
        setIssueLoading(false);
      });
  };

  const handleOnNewIssueSubmit = (event) => {
    event.preventDefault();
    if (newIssueVisible) {
      if (!newIssue) {
        return;
      }
      fetch(`${API_URL}/issues/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.access_token,
        },
        body: JSON.stringify({
          title: newIssue,
          user_id: "",
        }),
      })
        .then((response) => response.json())
        .then((newIssueId) => {
          setNewIssueVisible(false);
          fetch(`${API_URL}/issues`, {
            method: "GET",
            headers: {
              Authorization: "Bearer " + user.access_token,
            },
          })
            .then((response) => response.json())
            .then((issuesData) => {
              setIssues(issuesData);
              setSelectedIssue(issuesData.find((_) => _._id === newIssueId));
            });
        });
    } else {
      setNewIssueVisible(true);
    }
  };

  const handleOnNewIssue = (event) => {
    event.preventDefault();
    setNewIssue(event.target.value);
  };

  const handleOnCloseNewIssue = (event) => {
    event.preventDefault();
    setNewIssueVisible(false);
  };

  const handleNewChat = (event) => {
    event.preventDefault();
    setNewChat(event.target.value);
  };

  const handleChatSubmit = (event) => {
    event.preventDefault();
    if (!newChat) {
      return;
    }
    setIsApiLoading(true);

    fetch(`${API_URL}/chats/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.access_token,
      },
      body: JSON.stringify({
        text: newChat,
        user_id: "",
        is_bot: false,
        issue_id: selectedIssue._id,
        collection_name: collectionName,
        isOpenAI: isOpenAI,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setNewChat("");
        fetch(`${API_URL}/chats/${selectedIssue._id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + user.access_token,
          },
        })
          .then((response) => response.json())
          .then((chatsData) => {
            setChats(chatsData);
            setIsApiLoading(false);
          });
      });
  };

  const handleResolveIssue = (event) => {
    event.preventDefault();
    fetch(`${API_URL}/issues/resolve/${selectedIssue._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + user.access_token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        let updatedIssues = issues.map((issue) => {
          if (issue._id === selectedIssue._id) {
            issue.is_resolved = true;
          }
          return issue;
        });
        setIssues(updatedIssues);
      });
  };

  const getDateFormat = (date) => {
    return `${new Date(date).getDate()}/${
      new Date(date).getMonth() + 1
    }/${new Date(date).getFullYear()}`;
  };

  const handleOpenAI = (event) => {
    setOpenAI(event.target.checked);
  };

  const handleFile = (event) => {
    event.preventDefault();
    setOpenAI(false);
    setFile(event.target.files[0]);
    event.target.value = null;
  };

  const onhandleFileUpload = () => {
    if (!file) return;
    setIsApiLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    let collectionName = uuidv4();
    if (!file) return;
    fetch(`${API_URL}/upload/${collectionName}`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: "Bearer " + user.access_token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsApiLoading(false);
        if (data.success) {
          setCollectionName(collectionName);
          alert("File uploaded successfully");
          fetch(`${API_URL}/collections`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + user.access_token,
            },
          })
            .then((response) => response.json())
            .then((coll) => {
              setDocs(coll);
            });
        } else if (data.fileExists) {
          alert("File already exists");
        } else {
          alert("File upload failed");
        }
      });
  };

  const handleRemoveFile = (event) => {
    event.preventDefault();
    setFile(undefined);
    setCollectionName("");
    setOpenAI(true);
  };

  const handleSelectDoc = (event) => {
    event.preventDefault();
    setCollectionName(event.target.value);
    setOpenAI(false);
    setFile(undefined);
  };

  return user && issues && selectedIssue && issues.length > 0 ? (
    <div className="h-100">
      {isApiLoading ? (
        <div className="h-100 overlay-modal d-flex flex-column">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-5 bg-warning p-3">
            Currently data loading from api,
            <b>Please be patient as the azure resource is limited</b>. delay
            might be there do not refresh or exit the page.
          </p>
        </div>
      ) : null}
      <div className="h-100">
        <div className="h-100 section d-flex justify-content-between flex-column user-detail-section">
          <p className="mx-auto text-center border-bottom py-4">
            <span className="company-title text-center">XYZ</span>
            <span className="px-2">Customer portal</span>
          </p>
          <div>
            <div className="d-flex justify-content-start mx-3">
              <img
                src="https://www.w3schools.com/howto/img_avatar.png"
                alt="Avatar"
                className="avatar mb-4"
                width="75"
                height="75"
              />
            </div>
            <h5 className="text-left mb-4 mx-3">{user.full_name}</h5>

            <div className="mx-3">
              <p className="text-left">
                Last login: {getDateFormat(user.last_login)}
              </p>
              <p className="text-left">
                Created On: {getDateFormat(user.created_on)}
              </p>
              <p className="text-left">
                Resovled Issues: {issues.filter((_) => _.is_resolved).length}
              </p>
              <p className="text-left">Total Issues: {issues.length}</p>
            </div>
          </div>
          <div className="d-flex justify-content-between flex-column">
            {newIssueVisible ? (
              <div className="mx-3">
                <button
                  className="btn btn-small btn-link btn-warning p-1 mb-2 text-light text-decoration-none"
                  onClick={handleOnCloseNewIssue}
                >
                  close
                </button>
                <input
                  className="form-control form-control-lg"
                  type="text"
                  placeholder="New Issue"
                  value={newIssue}
                  onChange={handleOnNewIssue}
                />
              </div>
            ) : null}
            <button
              className="btn btn-small btn-primary m-3"
              onClick={handleOnNewIssueSubmit}
            >
              {newIssueVisible ? "Submit" : "New Issue"}
            </button>
            <button className="btn btn-small btn-danger m-3" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
        <div className="h-100 main d-flex justify-content-center flex-column chat-section">
          <div className="mx-2 mt-3 pb-3 chat-section-title d-flex">
            {selectedIssue.is_resolved ? null : (
              <button
                className="btn btn-sm btn-primary"
                onClick={handleResolveIssue}
              >
                Resolve
              </button>
            )}
            {issueLoading ? (
              <h5 className="mx-5 text-center">
                <span className="mx-3">loading</span>
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </h5>
            ) : (
              <h3 className="issue-title mx-5 pb-2">
                Issue: {selectedIssue.title}
              </h3>
            )}
          </div>
          <div className="chat-box mx-3 mt-5" ref={chatboxRef}>
            {chats.map((chat, index) => {
              return chat.is_bot ? (
                <div className="bot-message chat-message" key={`chats-bot-${index}`}>
                  <div className="bot-img d-flex justify-content-center align-items-center flex-column">
                    <span>xyz</span>
                    <span>BOT</span>
                  </div>
                  <p>{chat.text}</p>
                </div>
              ) : (
                <div className="user-message chat-message" key={`chat-user-${index}`}>
                  <img
                    src="https://www.w3schools.com/howto/img_avatar.png"
                    alt="Avatar"
                    className="avatar mb-2"
                    width="35"
                    height="35"
                  />
                  <p>{chat.text}</p>
                </div>
              );
            })}
          </div>
          <div className="pt-2 input-section">
            {selectedIssue.is_resolved ? (
              <p className="text-center mb-5">
                Issue Resolved. Create new Issue.
              </p>
            ) : (
              <div>
                <p className="mx-3">Ask Here,</p>
                <form
                  className="d-flex justify-content-between align-items-center m-3"
                  onSubmit={handleChatSubmit}
                >
                  <div className="col-11">
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newChat}
                      onChange={handleNewChat}
                    ></textarea>
                  </div>
                  <div className="col-1">
                    <button className="btn btn-sm btn-success mx-3">
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="h-100 section issue-list-section">
          <h5 className=" mx-auto text-center border-bottom py-3 mb-4">
            Customer History
          </h5>
          <ul className="list-group list-group-flush">
            {issues.map((issue, index) => {
              return (
                <li
                  className="list-group-item"
                  key={`issues-${index}`}
                  onClick={() => {
                    handleOnIssue(issue);
                  }}
                >
                  {index + 1} | {issue.title}
                </li>
              );
            })}
          </ul>
          <div className="mx-3 mt-5">
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="openAI"
                checked={isOpenAI}
                onChange={handleOpenAI}
              />
              <label className="form-check-label" htmlFor="openAI">
                get from chat GPT-3.5 or Internet
              </label>
            </div>
            <div className="input-group">
              <input
                type="file"
                className="form-control"
                aria-label="Upload"
                onChange={handleFile}
                accept="application/pdf"
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                id="inputFile"
                onClick={onhandleFileUpload}
              >
                Upload
              </button>
            </div>
            {file ? (
              <div>
                <p className="mt-3 file-name">File Name:</p>
                <p className="mt-3 file-name">{file.name}</p>
              </div>
            ) : null}
            <div className="input-group mt-2">
              <select
                className="form-select"
                id="inputGroupSelect04"
                aria-label="Example select with button addon"
                onChange={handleSelectDoc}
                value={collectionName}
              >
                <option key={`doc-no-select`} value={""}>
                  Choose from existing docs
                </option>
                {docs.map((doc, index) => {
                  return (
                    <option key={`doc-${index}`} value={doc.collection_id}>
                      {doc.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              className="btn btn-sm btn-warning mt-3"
              onClick={handleRemoveFile}
            >
              clear File
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="d-flex justify-content-center flex-column align-items-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-4">xyz customer portal</p>
      </div>
    </div>
  );
}

export default Home;
