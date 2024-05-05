import React, {useState, useEffect, useRef} from "react";
import {Container, Row, Button, Col, Image, Card} from "react-bootstrap";
import CarCard from "./car_card";
import top5Service from "../../services/top5Service";

const CardCarousel = () => {
    const [vehicles, setVehicles] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const highlightedImageStyle = {
        width: "100vw", // Adjusted to take up the entire width of the screen
        height: "65vh",
        objectFit: "cover",
    };

    const timerRef = useRef(null);

    useEffect(() => {
        top5Service
            .getTop5()
            .then((response) => {
                if (response.status === "success") {
                    setVehicles(response.data);
                } else {
                    console.error("Failed to fetch top vehicles:", response.message);
                }
            })
            .catch((error) => {
                console.error("Error fetching top vehicles:", error);
            });
    }, []);

    useEffect(() => {
        // Create placeholders when vehicles array is empty
        if (vehicles.length === 0) {
            setVehicles(
                Array.from({length: 5}, (_, index) => ({
                    vehicle_id: `placeholder-${index}`,
                    body_type: "placeholder",
                    make: "Loading",
                    model: "Vehicle...",
                    price: " Loading...",
                }))
            );
        } else {
            // Start the timer to move the highlighted card every 4 seconds
            timerRef.current = setInterval(() => {
                setHighlightedIndex((prevIndex) => (prevIndex + 1) % vehicles.length);
            }, 4000);
        }

        // Clean up the timer
        return () => clearInterval(timerRef.current);
    }, [vehicles]);

    const handleHighlightedImageClick = () => {
        // Trigger the onClick event for the respective CarCard
        setHighlightedIndex((prevIndex) => (prevIndex + 1) % vehicles.length);
    };

    const handleCardMouseEnter = (index) => {
        // Set the hovered index and clear the timer
        setHoveredIndex(index);
        clearInterval(timerRef.current);
    };

    const handleCardMouseLeave = () => {
        // Clear the hovered index and restart the timer
        setHoveredIndex(null);
        timerRef.current = setInterval(() => {
            setHighlightedIndex((prevIndex) => (prevIndex + 1) % vehicles.length);
        }, 4000);
    };

    // Render placeholders for CarCards
    const renderPlaceholders = () => {
        const placeholders = [];
        for (let i = 0; i < vehicles.length; i++) {
            placeholders.push(
                <Col
                    xs={2}
                    key={i}
                    id={`placeholder-card-wrapper-${i}`}
                    className="d-flex justify-content-center"
                >
                    <Card
                        style={{
                            width: "250px",
                            minWidth: "250px",
                            height: "300px",
                            margin: "1rem",
                            backgroundColor: "grey",
                            backgroundImage: `url(${process.env.PUBLIC_URL}/cars/placeholder/loading.jpg)`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    >
                        <Card.Body>
                            <Card.Text>Loading...</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            );
        }
        return placeholders;
    };

    return (
        <Container fluid style={{padding: 0, margin: 0}}>
            <div className="carousel-container" style={{backgroundColor: "#1c1c1c"}}>
                <div className="highlighted-image-container" style={{paddingTop: 10}}>
                    {vehicles.length > 0 && (
                        <Image
                            src={`${process.env.PUBLIC_URL}/cars/${vehicles[highlightedIndex].body_type.toLowerCase()}/${vehicles[highlightedIndex].body_type.toLowerCase()}.jpg`}
                            fluid
                            style={{...highlightedImageStyle, borderRadius: "8px"}} // Apply border radius
                            className="highlighted-vehicle-image"
                            onClick={handleHighlightedImageClick} // Attach onClick handler to the Image
                        />
                    )}
                </div>
                <Container fluid id="card-carousel-container" style={{padding: 10}}>
                    <Row className="align-items-center justify-content-center" id="button-and-card-row">
                        <Col xs={1} className="d-flex justify-content-center" id="previous-button-column">
                            <Button
                                id="previous-button"
                                onClick={() =>
                                    setHighlightedIndex((prevIndex) => (prevIndex - 1 + vehicles.length) % vehicles.length)
                                }
                                style={{
                                    margin: "0 10px",
                                    backgroundColor: "#8a00ff",
                                    border: "none"
                                }} // Set background color to #8a00ff
                            >
                                &lt;
                            </Button>
                        </Col>
                        {/* Render CarCards or placeholders based on whether there is data */}
                        {vehicles.length > 0 ? (
                            vehicles.map((vehicle, index) => (
                                <Col
                                    xs={2}
                                    key={index}
                                    id={`car-card-wrapper-${index}`}
                                    onMouseEnter={() => handleCardMouseEnter(index)}
                                    onMouseLeave={handleCardMouseLeave}
                                    className="d-flex justify-content-center"
                                >
                                    <CarCard
                                        id={`car-card-${index}`}
                                        vehicle={vehicle}
                                        highlighted={index === highlightedIndex || index === hoveredIndex}
                                    />
                                </Col>
                            ))
                        ) : (
                            renderPlaceholders()
                        )}
                        <Col xs={1} className="d-flex justify-content-center" id="next-button-column">
                            <Button
                                id="next-button"
                                onClick={() => setHighlightedIndex((prevIndex) => (prevIndex + 1) % vehicles.length)}
                                style={{
                                    margin: "0 10px",
                                    backgroundColor: "#8a00ff",
                                    border: "none" // Remove the blue border
                                }}
                            >
                                &gt;
                            </Button>

                        </Col>
                    </Row>
                </Container>
            </div>
        </Container>
    );
};

export default CardCarousel;
